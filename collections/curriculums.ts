import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { count, createCollection, createLiveQueryCollection, createOptimisticAction, eq } from "@tanstack/react-db";
import { ApiResponse, PaginatedResult } from "@/types/ApiResponse";
import { queryClient } from "@/lib/utils";
import { levelCollection } from "./levels";

export type EducationCurriculumItem = {
    id: number;
    nameAr: string;
    nameEn: string;
    country: string;
    domainId: number;
    descriptionAr: string;
    descriptionEn: string;
    isActive: boolean;
    createdAt: string;
};

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Accept': 'application/json',
    'Accept-Language': localStorage.getItem('locale') === 'en' ? 'en-US' : 'ar-EG',
})

export const curriculumCollection = createCollection(queryCollectionOptions({
    queryKey: () => ['curriculums'],
    queryFn: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Curriculum`, {
            headers: authHeaders(),
        })
        if (!response.ok) {
            throw new Error('Failed to fetch curriculums')
        }
        // Tolerate both a direct array and a paginated { items: [...] } envelope.
        const data: ApiResponse<PaginatedResult<EducationCurriculumItem> | EducationCurriculumItem[]> = await response.json()
        return Array.isArray(data.data) ? data.data : data.data?.items ?? []
    },
    queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Curriculum`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(item),
        })
        const data: ApiResponse<EducationCurriculumItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as EducationCurriculumItem
    },
    onUpdate: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Curriculum/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item),
        })
        const data: ApiResponse<EducationCurriculumItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as EducationCurriculumItem
    },
    onDelete: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Curriculum/${item.id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        })
        const data: ApiResponse<EducationCurriculumItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as EducationCurriculumItem
    },
}))

export type ToggleStatusPayload = EducationCurriculumItem

export const toggleStatus = createOptimisticAction<ToggleStatusPayload>({
        onMutate: (data) => {
            curriculumCollection.update(
                data.id,
                draft => { draft.isActive = !draft.isActive }
            )
        },
        mutationFn: async (data) => {
            const access_token = localStorage.getItem('access_token');
            const locale = localStorage.getItem('locale');
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Curriculum/${data.id}/toggle-status`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`,
                        'Accept': 'application/json',
                        'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
                    },
                    body: JSON.stringify(data),
                })
                const responseData: ApiResponse<EducationCurriculumItem> = await response.json()
                if (!response.ok) {
                    throw new Error(responseData.message)
                }

                await curriculumCollection.utils.refetch()

                return responseData.data as EducationCurriculumItem
            } catch (error) {
                console.error(error)
                throw error
            }
        }
    })

export const curriculumWithLevelsCount = createLiveQueryCollection({
    query: q => {
        const levelsCount = q.from({levels: levelCollection})
        .groupBy(({levels}) => levels.curriculumId)
        .select(({levels}) => ({
            curriculumId: levels.curriculumId,
            count: count(levels?.id ?? 0),
        }))

        const curriculums = q.from({curriculums: curriculumCollection})
        .join({levelsCount: levelsCount}, ({curriculums, levelsCount}) => eq(curriculums.id, levelsCount.curriculumId), 'left')
        .select(({curriculums, levelsCount}) => ({
            ...curriculums,
            levelsCount: levelsCount?.count ?? 0,
        }))

        return q.from({curriculums})
    }
})
