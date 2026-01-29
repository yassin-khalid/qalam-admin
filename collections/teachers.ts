import { queryClient } from "@/lib/utils";
import { ApiResponse } from "@/types/ApiResponse";
import { createCollection, createOptimisticAction } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

type PendingTeacher = {
    teacherId: number;
    userId: number;
    fullName: string;
    phoneNumber: string;
    email: string;
    status: number;
    location: number;
    createdAt: string;
    totalDocuments: number;
    pendingDocuments: number;
    approvedDocuments: number;
    rejectedDocuments: number;
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

export const teacherColllection = createCollection(queryCollectionOptions(
    {
        queryKey: ['teachers'],
        queryFn: async () => {
            const access_token = localStorage.getItem('access_token');
            const locale = localStorage.getItem('locale');

            try {

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherManagement/Pending`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                    'Accept': 'application/json',
                    'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
                },
            });
            const data = await response.json() as ApiResponse<PendingTeacher[]>
            if (!data.succeeded) {
                throw new Error(data.message);
            }
            return data.data ?? [];
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