import { ApiResponse, PaginatedResult } from "@/types/ApiResponse"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { count, createCollection, createLiveQueryCollection, eq } from "@tanstack/react-db"
import { queryClient } from "@/lib/utils"
import { gradeCollection } from "./grades"

export type EducationLevelItem = {
    id: number,
    domainId: number,
    curriculumId: number,
    nameAr: string,
    nameEn: string,
    orderIndex: number,
    isActive: boolean,
    createdAt: string,
}

export const levelCollection = createCollection(queryCollectionOptions({
    queryKey: () => ['levels'],
    queryFn: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Levels`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        if (!response.ok) {
            throw new Error('Failed to fetch levels')
        }
        // Tolerate both a direct array and a paginated { items: [...] } envelope.
        const data: ApiResponse<PaginatedResult<EducationLevelItem> | EducationLevelItem[]> = await response.json()
        return Array.isArray(data.data) ? data.data : data.data?.items ?? []
    },
    queryClient,
    getKey: (item) => item.id,
    // Levels are create + list only (no update/delete REST API — see CRUD guide §13).
    onInsert: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Levels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Accept': 'application/json',
                'Accept-Language': localStorage.getItem('locale') === 'en' ? 'en-US' : 'ar-EG',
            },
            body: JSON.stringify(item),
        })
        const data: ApiResponse<EducationLevelItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as EducationLevelItem
    },
}))


export const levelWithGradesCount = createLiveQueryCollection({
    query: q => {
        const gradesCount = q.from({ grades: gradeCollection })
        // .where(({grades}) => eq(grades.isActive, true))
        .groupBy(({grades }) => grades.levelId)
        .select(({grades}) => ({
            levelId: grades.levelId,
            count: count(grades?.id ?? 0)
        }))

        const levels = q.from({ levels: levelCollection })
        .join({ gradesCount: gradesCount }, ({levels, gradesCount}) => eq(levels.id, gradesCount.levelId), 'left')
        .select(({levels, gradesCount}) => ({
            ...levels,
            gradesCount: gradesCount?.count ?? 0,
        }))

        return q.from({ levels })
    }
})