import { ApiResponse, PaginatedResult } from "@/types/ApiResponse"
import { queryCollectionOptions } from "@tanstack/query-db-collection"
import { count, createCollection, createLiveQueryCollection, eq } from "@tanstack/react-db"
import { queryClient } from "@/lib/utils"
import { gradeCollection } from "./grades"

export type EducationLevelItem = {
    id: number,
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
        const data: ApiResponse<PaginatedResult<EducationLevelItem>> = await response.json()
        return data.data.items
    },
    queryClient,
    getKey: (item) => item.id,
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
        .join({ gradesCount: gradesCount }, ({levels, gradesCount}) => eq(levels.id, gradesCount.levelId))
        .select(({levels, gradesCount}) => ({
            ...levels,
            gradesCount: gradesCount?.count ?? 0,
        }))

        return q.from({ levels })
    }
})