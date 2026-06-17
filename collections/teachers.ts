import { queryClient } from "@/lib/utils";
import { ApiResponse } from "@/types/ApiResponse";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { LocationValue, normalizeLocation, normalizeTeacherStatus } from "@/lib/teacher-status";

// Canonical shape used by the UI: status is the numeric TeacherStatus code,
// location is the canonical Inside/Outside string union. Shared by the "all
// teachers" list (AdminTeacherListItemDto) and the pending queue
// (PendingTeacherDto) — both endpoints return the same fields.
export type TeacherListItem = {
    teacherId: number;
    userId: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    status: number;
    location: LocationValue;
    createdAt: string;
    totalDocuments: number;
    pendingDocuments: number;
    approvedDocuments: number;
    rejectedDocuments: number;
}

// Back-compat alias — older code referred to this list row as PendingTeacher.
export type PendingTeacher = TeacherListItem;

// Raw row as it arrives from the API — status/location may be string enums or numbers.
type RawTeacherListItem = Omit<TeacherListItem, "status" | "location"> & {
    status: string | number;
    location: string | number | boolean | null;
}
// export type TeacherDocument = {
// id: number;
//     documentType: number;
//     filePath: string;
//     verificationStatus: number;
//     rejectionReason: string | null;
//     reviewedAt: string | null;
//     documentNumber: string;
//     identityType: number;
//     issuingCountryCode: string | null;
//     certificateTitle: string | null;
//     issuer: string | null;
//     issueDate: string | null;
//     createdAt: string;
// }

// /Teachers (Endpoint 1) is paginated and caps pageSize at 50. We want EVERY
// teacher (all statuses) so the list page can filter/search/tally client-side,
// so page through until the server reports no next page.
const MAX_PAGE_SIZE = 50;

export const teacherColllection = createCollection(queryCollectionOptions(
    {
        queryKey: ['teachers'],
        queryFn: async () => {
            const access_token = localStorage.getItem('access_token');
            const locale = localStorage.getItem('locale');

            try {
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                    'Accept': 'application/json',
                    'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
                };

                const rows: RawTeacherListItem[] = [];
                let pageNumber = 1;
                // Safety bound on the loop in case meta is missing/malformed.
                for (;;) {
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherManagement/Teachers?pageNumber=${pageNumber}&pageSize=${MAX_PAGE_SIZE}`,
                        { method: 'GET', headers },
                    );
                    const data = await response.json() as ApiResponse<RawTeacherListItem[]>
                    if (!data.succeeded) {
                        throw new Error(data.message);
                    }
                    rows.push(...(data.data ?? []));
                    if (!data.meta?.hasNextPage) break;
                    pageNumber += 1;
                }

                return rows.map((teacher) => ({
                    ...teacher,
                    status: normalizeTeacherStatus(teacher.status),
                    location: normalizeLocation(teacher.location),
                }));
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
        queryClient,
        getKey: (item) => item.teacherId,
    }
))

// export const approveDocument = createOptimisticAction<{teacherId: number, documentId: number}>({
//     onMutate: ({teacherId, documentId}) => {
//         const collection = teacherDocumentsCollection(teacherId);
//         // Check if the collection has been fetched and has data
//         const queryState = queryClient.getQueryState(['teacher-documents', teacherId]);
        
//         // Only update if we have data (collection has been fetched)
//         if (queryState?.data) {
//             console.log("data:", queryState.data);
//             collection.update(documentId, draft => {
//                 draft.verificationStatus = 1;
//             });
//         }
//             },
//     mutationFn: async ({teacherId, documentId}) => {
//         const access_token = localStorage.getItem('access_token');
//         const locale = localStorage.getItem('locale');
//         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherManagement/${teacherId}/Documents/${documentId}/Approve`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${access_token}`,
//                 'Accept': 'application/json',
//                 'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
//             },
//         });
//         const data = await response.json() as ApiResponse<null>
//         if (!data.succeeded) {
//             throw new Error(data.message);
//         }
//         await teacherDocumentsCollection(teacherId).utils.refetch();
//         return data.message;
//     },
// })

// export const teacherDocumentsCollection = (teacherId: number) => createCollection(queryCollectionOptions(
//     {
//         queryKey: ['teacher-documents', teacherId],
//         queryFn: async () => {
//             const access_token = localStorage.getItem('access_token');
//             const locale = localStorage.getItem('locale');
//             try {
//                 const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherManagement/${teacherId}`, {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${access_token}`,
//                         'Accept': 'application/json',
//                         'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
//                     },
//                 });
//                 const data = await response.json()
//                 if (!data.succeeded) {
//                     throw new Error(data.message);
//                 }
//                 return data?.data?.documents as TeacherDocument[];
//             } catch (error) {
//                 console.error(error);
//                 throw error;
//             }
//         },
//         queryClient,
//         getKey: (item) => item.id,
//     }
// ))  