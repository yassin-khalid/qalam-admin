import { queryClient } from "@/lib/utils";
import { ApiResponse } from "@/types/ApiResponse";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { normalizeVerificationStatus } from "@/lib/teacher-status";

// Global teacher-subjects list (Endpoint #7): operations view across all teachers.
// verificationStatus arrives as a string enum or number — normalize to numeric.
export type AdminTeacherSubjectUnit = {
    id: number;
    unitId: number;
    unitNameAr: string;
    unitNameEn: string;
    unitTypeCode: string | null;
    quranContentTypeId: number | null;
    quranContentTypeNameAr: string | null;
    quranContentTypeNameEn: string | null;
    quranLevelId: number | null;
    quranLevelNameAr: string | null;
    quranLevelNameEn: string | null;
}

export type AdminTeacherSubject = {
    id: number;
    teacherId: number;
    teacherFullName: string;
    subjectId: number;
    subjectNameAr: string;
    subjectNameEn: string;
    domainCode: string | null;
    canTeachFullSubject: boolean;
    isActive: boolean;
    verificationStatus: number;
    rejectionReason: string | null;
    reviewedAt: string | null;
    createdAt: string;
    units: AdminTeacherSubjectUnit[];
}

type RawAdminTeacherSubject = Omit<AdminTeacherSubject, "verificationStatus"> & {
    verificationStatus: string | number;
}

const MAX_PAGE_SIZE = 50;

// Page through every subject (all statuses) so the list page can filter/search
// client-side, mirroring the all-teachers collection.
export const teacherSubjectsCollection = createCollection(queryCollectionOptions(
    {
        queryKey: ['teacher-subjects'],
        queryFn: async () => {
            const access_token = localStorage.getItem('access_token');
            const locale = localStorage.getItem('locale');

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
                'Accept': 'application/json',
                'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
            };

            const rows: RawAdminTeacherSubject[] = [];
            let pageNumber = 1;
            for (;;) {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherManagement/Subjects?pageNumber=${pageNumber}&pageSize=${MAX_PAGE_SIZE}`,
                    { method: 'GET', headers },
                );
                const data = await response.json() as ApiResponse<RawAdminTeacherSubject[]>
                if (!data.succeeded) {
                    throw new Error(data.message);
                }
                rows.push(...(data.data ?? []));
                if (!data.meta?.hasNextPage) break;
                pageNumber += 1;
            }

            return rows.map((subject) => ({
                ...subject,
                verificationStatus: normalizeVerificationStatus(subject.verificationStatus),
            }));
        },
        queryClient,
        getKey: (item) => item.id,
    }
))
