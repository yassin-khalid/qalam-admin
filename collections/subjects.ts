import { queryClient } from "@/lib/utils";
import { ApiResponse, PaginatedResult } from "@/types/ApiResponse";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

export type SubjectItem = {
    id: number,
    levelId: number,
    gradeId: number,
    termId: number | null,
    nameAr: string,
    nameEn: string,
    descriptionAr: string,
    descriptionEn: string,
    isActive: boolean,
    createdAt: string,
}

export const subjectCollection = createCollection(queryCollectionOptions({
    queryKey: ['subjects'],
    queryFn: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Subjects`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        if (!response.ok) {
            throw new Error('Failed to fetch subjects')
        }
        const data: ApiResponse<PaginatedResult<SubjectItem>> = await response.json()
        return data.data.items
    },
    queryClient,
    getKey: (item) => item.id,
}))