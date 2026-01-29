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

export const curriculumCollection = createCollection(queryCollectionOptions({
    queryKey: () => ['curriculums'],
    queryFn: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Curriculum`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        if (!response.ok) {
            throw new Error('Failed to fetch curriculums')
        }
        const data: ApiResponse<PaginatedResult<EducationCurriculumItem>> = await response.json()
        return data.data.items
    },
    queryClient,
    getKey: (item) => item.id,
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
        .join({levelsCount: levelsCount}, ({curriculums, levelsCount}) => eq(curriculums.id, levelsCount.curriculumId))
        .select(({curriculums, levelsCount}) => ({
            ...curriculums,
            levelsCount: levelsCount?.count ?? 0,
        }))

        return q.from({curriculums})
    }
})
