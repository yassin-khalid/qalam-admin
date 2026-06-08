import { queryClient } from "@/lib/utils";
import { ApiResponse } from "@/types/ApiResponse";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";

// Requirement type as returned by read endpoints (string) vs write endpoints (number).
export type RequirementTypeName = "File" | "Text" | "Boolean" | "Selection";

export const REQUIREMENT_TYPE_TO_NUMBER: Record<RequirementTypeName, number> = {
    File: 1,
    Text: 2,
    Boolean: 3,
    Selection: 4,
};

const NUMBER_TO_REQUIREMENT_TYPE: Record<number, RequirementTypeName> = {
    1: "File",
    2: "Text",
    3: "Boolean",
    4: "Selection",
};

// 1 Identity, 2 Certificate, 3 Other (file types only)
export type MapsToDocumentType = 1 | 2 | 3;

// A single choice in a Selection requirement (bilingual label keyed by value).
export type RequirementOption = {
    value: string;
    labelAr: string;
    labelEn: string;
};

export type TeacherRegistrationRequirement = {
    id: number;
    code: string;
    nameAr: string;
    nameEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    requirementType: RequirementTypeName;
    isActive: boolean;
    isRequired: boolean;
    isSystem: boolean;
    sortOrder: number;
    minCount: number | null;
    maxCount: number | null;
    maxFileSizeBytes: number | null;
    allowedExtensions: string[] | null;
    maxLength: number | null;
    mapsToDocumentType: MapsToDocumentType | null;
    options: RequirementOption[] | null;
    createdAt: string | null;
};

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherRegistrationRequirements`;

function authHeaders() {
    const accessToken = localStorage.getItem("access_token");
    const locale = localStorage.getItem("locale") ?? "ar";
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "Accept-Language": locale === "ar" ? "ar-EG" : "en-US",
    };
}

// Raw server DTO — enums may arrive as strings or numbers depending on the endpoint.
type RawRequirement = {
    id: number;
    code: string;
    nameAr?: string | null;
    nameEn?: string | null;
    descriptionAr?: string | null;
    descriptionEn?: string | null;
    requirementType?: RequirementTypeName | number | null;
    isActive?: boolean;
    isRequired?: boolean;
    isSystem?: boolean;
    sortOrder?: number;
    minCount?: number | null;
    maxCount?: number | null;
    maxFileSizeBytes?: number | null;
    allowedExtensions?: string[] | null;
    maxLength?: number | null;
    mapsToDocumentType?: MapsToDocumentType | null;
    options?: RequirementOption[] | null;
    createdAt?: string | null;
};

export function toRequirementTypeName(value: unknown): RequirementTypeName {
    if (typeof value === "number") return NUMBER_TO_REQUIREMENT_TYPE[value] ?? "File";
    if (value === "File" || value === "Text" || value === "Boolean" || value === "Selection") return value;
    return "File";
}

// Coerce a raw options payload into clean RequirementOption rows (drops malformed entries).
function normalizeOptions(raw: RequirementOption[] | null | undefined): RequirementOption[] | null {
    if (!Array.isArray(raw)) return null;
    const cleaned = raw
        .filter((o): o is RequirementOption => !!o && typeof o.value === "string")
        .map((o) => ({
            value: o.value,
            labelAr: o.labelAr ?? "",
            labelEn: o.labelEn ?? "",
        }));
    return cleaned.length ? cleaned : null;
}

// Normalize a server DTO (which may use string or numeric enums) into our stored shape.
function normalize(raw: RawRequirement): TeacherRegistrationRequirement {
    return {
        id: raw.id,
        code: raw.code,
        nameAr: raw.nameAr ?? "",
        nameEn: raw.nameEn ?? "",
        descriptionAr: raw.descriptionAr ?? null,
        descriptionEn: raw.descriptionEn ?? null,
        requirementType: toRequirementTypeName(raw.requirementType),
        isActive: raw.isActive ?? false,
        isRequired: raw.isRequired ?? false,
        isSystem: raw.isSystem ?? false,
        sortOrder: raw.sortOrder ?? 0,
        minCount: raw.minCount ?? null,
        maxCount: raw.maxCount ?? null,
        maxFileSizeBytes: raw.maxFileSizeBytes ?? null,
        allowedExtensions: raw.allowedExtensions ?? null,
        maxLength: raw.maxLength ?? null,
        mapsToDocumentType: raw.mapsToDocumentType ?? null,
        options: normalizeOptions(raw.options),
        createdAt: raw.createdAt ?? null,
    };
}

// Build the request body the API expects (numeric enums) from a stored item.
// The backend types the numeric fields as non-nullable int, so an explicit `null`
// fails JSON deserialization — we OMIT fields that don't apply to the chosen type
// (and any null number) rather than sending null.
function toRequestBody(item: TeacherRegistrationRequirement) {
    const isFile = item.requirementType === "File";
    const isSelection = item.requirementType === "Selection";
    const isText = item.requirementType === "Text";

    const body: Record<string, unknown> = {
        code: item.code,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        descriptionAr: item.descriptionAr,
        descriptionEn: item.descriptionEn,
        requirementType: REQUIREMENT_TYPE_TO_NUMBER[item.requirementType],
        isActive: item.isActive,
        isRequired: item.isRequired,
        sortOrder: item.sortOrder,
    };

    // minCount/maxCount drive file cardinality and selection cardinality.
    if (isFile || isSelection) {
        if (item.minCount != null) body.minCount = item.minCount;
        if (item.maxCount != null) body.maxCount = item.maxCount;
    }
    if (isFile) {
        if (item.maxFileSizeBytes != null) body.maxFileSizeBytes = item.maxFileSizeBytes;
        body.allowedExtensions = item.allowedExtensions; // List<string>, null tolerated
        if (item.mapsToDocumentType != null) body.mapsToDocumentType = item.mapsToDocumentType;
    }
    if (isText && item.maxLength != null) {
        body.maxLength = item.maxLength;
    }
    if (isSelection) {
        body.options = item.options;
    }
    return body;
}

export const teacherRequirementsCollection = createCollection(
    queryCollectionOptions({
        queryKey: ["teacher-registration-requirements"],
        queryFn: async () => {
            const response = await fetch(BASE_URL, { headers: authHeaders() });
            const json: ApiResponse<RawRequirement[] | { items: RawRequirement[] }> = await response.json();
            if (!response.ok || !json.succeeded) {
                throw new Error(json.message ?? "Failed to fetch requirements");
            }
            // List may be a plain array or a paginated result { items: [...] }.
            const payload = json.data;
            const items: RawRequirement[] = Array.isArray(payload) ? payload : payload?.items ?? [];
            return items.map(normalize);
        },
        queryClient,
        getKey: (item) => item.id,
        onInsert: async ({ transaction }) => {
            const item = transaction.mutations[0].modified as TeacherRegistrationRequirement;
            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(toRequestBody(item)),
            });
            const json: ApiResponse<RawRequirement> = await response.json();
            if (!response.ok || !json.succeeded) {
                throw new Error(json.message ?? "Failed to create requirement");
            }
            return normalize(json.data);
        },
        onUpdate: async ({ transaction }) => {
            const item = transaction.mutations[0].modified as TeacherRegistrationRequirement;
            const response = await fetch(`${BASE_URL}/${item.id}`, {
                method: "PUT",
                headers: authHeaders(),
                // Code is immutable on update; the rest of UpdateTeacherRegistrationRequirementDto.
                body: JSON.stringify(toRequestBody(item)),
            });
            const json: ApiResponse<RawRequirement> = await response.json();
            if (!response.ok || !json.succeeded) {
                throw new Error(json.message ?? "Failed to update requirement");
            }
            return normalize(json.data);
        },
        onDelete: async ({ transaction }) => {
            const item = transaction.mutations[0].original as TeacherRegistrationRequirement;
            const response = await fetch(`${BASE_URL}/${item.id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const json: ApiResponse<unknown> = await response.json();
            if (!response.ok || !json.succeeded) {
                throw new Error(json.message ?? "Failed to delete requirement");
            }
            return item;
        },
    })
);

// Visibility toggle uses a dedicated PATCH endpoint, not the generic PUT.
export async function toggleRequirementActive(id: number, isActive: boolean) {
    const response = await fetch(`${BASE_URL}/${id}/active`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ isActive }),
    });
    const json: ApiResponse<unknown> = await response.json();
    if (!response.ok || !json.succeeded) {
        throw new Error(json.message ?? "Failed to toggle requirement");
    }
    await teacherRequirementsCollection.utils.refetch();
    return json.message;
}
