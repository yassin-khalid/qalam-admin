// Helpers tolerant to BOTH the string enum names the API now returns
// (e.g. "PendingVerification", "InsideSaudiArabia") and the older numeric
// codes / optimistic-update values. Everything downstream works with the
// canonical numeric status code and the canonical location string union.

export type TeacherStatusName =
    | "AwaitingDocuments"
    | "PendingVerification"
    | "DocumentsRejected"
    | "Active"
    | "Blocked"

// TeacherStatus enum (backend): 1..5.
export const TEACHER_STATUS: Record<TeacherStatusName, number> = {
    AwaitingDocuments: 1,
    PendingVerification: 2,
    DocumentsRejected: 3,
    Active: 4,
    Blocked: 5,
}

// Normalize a wire value (string name or number) to its numeric code; 0 = unknown.
export function normalizeTeacherStatus(value: string | number | null | undefined): number {
    if (typeof value === "number") return value
    if (typeof value === "string") {
        if (value in TEACHER_STATUS) return TEACHER_STATUS[value as TeacherStatusName]
        const asNumber = Number(value)
        if (value.trim() !== "" && !Number.isNaN(asNumber)) return asNumber
    }
    return 0
}

// Document review status (backend TeacherDocument.VerificationStatus enum): 1..3.
// The API may return either the string name ("Pending"/"Approved"/"Rejected") or
// the numeric code. UI compares against numbers, so normalize to the numeric code.
export type VerificationStatusName = "Pending" | "Approved" | "Rejected"

export const VERIFICATION_STATUS: Record<VerificationStatusName, number> = {
    Pending: 1,
    Approved: 2,
    Rejected: 3,
}

export function normalizeVerificationStatus(value: string | number | null | undefined): number {
    if (typeof value === "number") return value
    if (typeof value === "string") {
        if (value in VERIFICATION_STATUS) return VERIFICATION_STATUS[value as VerificationStatusName]
        const asNumber = Number(value)
        if (value.trim() !== "" && !Number.isNaN(asNumber)) return asNumber
    }
    return 0
}

export type LocationValue = "InsideSaudiArabia" | "OutsideSaudiArabia" | null

// Tolerant to the string enum, a numeric enum (1 inside / 2 outside) and the
// raw isInSaudiArabia boolean.
export function normalizeLocation(
    value: string | number | boolean | null | undefined
): LocationValue {
    if (value === "InsideSaudiArabia" || value === "OutsideSaudiArabia") return value
    if (value === true || value === 1 || value === "1") return "InsideSaudiArabia"
    if (value === false || value === 2 || value === "2") return "OutsideSaudiArabia"
    return null
}

// Translation key for a location value, or null when unknown (caller falls back).
export function locationLabelKey(value: LocationValue): string | null {
    if (value === "InsideSaudiArabia") return "teachers.insideSaudi"
    if (value === "OutsideSaudiArabia") return "teachers.outsideSaudi"
    return null
}
