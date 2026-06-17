import { queryClient } from "@/lib/utils";
import { ApiResponse, PaginatedResult } from "@/types/ApiResponse";
import { createCollection } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";

export type LessonItem = {
    id: number,
    unitId: number,
    nameAr: string,
    nameEn: string,
    orderIndex: number,
    isActive: boolean,
    createdAt: string,
}

// Lessons are create + list only (no update/delete REST API — see CRUD guide §10/§13).
export const lessonCollection = createCollection(queryCollectionOptions({
    queryKey: () => ['lessons'],
    queryFn: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Content/Lessons`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            }
        })
        if (!response.ok) {
            throw new Error('Failed to fetch lessons')
        }
        // Tolerate both a direct array and a paginated { items: [...] } envelope.
        const data: ApiResponse<PaginatedResult<LessonItem> | LessonItem[]> = await response.json()
        return Array.isArray(data.data) ? data.data : data.data?.items ?? []
    },
    queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Content/Lessons`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Accept': 'application/json',
                'Accept-Language': localStorage.getItem('locale') === 'en' ? 'en-US' : 'ar-EG',
            },
            body: JSON.stringify(item),
        })
        const data: ApiResponse<LessonItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as LessonItem
    },
}))
