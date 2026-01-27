import { count, createCollection, createLiveQueryCollection, eq } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient } from "@/lib/utils";
import { ApiResponse, PaginatedResult } from "@/types/ApiResponse";
import { subjectCollection } from "./subjects";

export type EducationGradeItem = {
    id: number,
    levelId: number,
    nameAr: string,
    nameEn: string,
    orderIndex: number,
    isActive: boolean,
    createdAt: string,
}

export const gradeCollection = createCollection(queryCollectionOptions({
    queryKey: () => ['grades'],
    queryFn: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Grades`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        if (!response.ok) {
            throw new Error('Failed to fetch grades')
        }
        const data: ApiResponse<PaginatedResult<EducationGradeItem>> = await response.json()
        return data.data.items
    },
    queryClient,
    getKey: (item) => item.id,
}))

export const gradeWithSubjectsCount = createLiveQueryCollection({
    query: q => {
        const subjectsCount = q.from({ subjects: subjectCollection })
        .groupBy(({subjects}) => subjects.gradeId)
        .select(({subjects}) => ({
            gradeId: subjects.gradeId,
            count: count(subjects?.id ?? 0)
        }))

        const grades = q.from({ grades: gradeCollection })
        .join({ subjectsCount: subjectsCount }, ({grades, subjectsCount}) => eq(grades.id, subjectsCount.gradeId))
        .select(({grades, subjectsCount}) => ({
            ...grades,
            subjectsCount: subjectsCount?.count ?? 0,
        }))

        return q.from({ grades })
    }
})