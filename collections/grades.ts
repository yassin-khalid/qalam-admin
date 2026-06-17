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
        // Tolerate both a direct array and a paginated { items: [...] } envelope.
        const data: ApiResponse<PaginatedResult<EducationGradeItem> | EducationGradeItem[]> = await response.json()
        return Array.isArray(data.data) ? data.data : data.data?.items ?? []
    },
    queryClient,
    getKey: (item) => item.id,
    // Grades are create + list only (no update/delete REST API — see CRUD guide §13).
    onInsert: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Grades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Accept': 'application/json',
                'Accept-Language': localStorage.getItem('locale') === 'en' ? 'en-US' : 'ar-EG',
            },
            body: JSON.stringify(item),
        })
        const data: ApiResponse<EducationGradeItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as EducationGradeItem
    },
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
        .join({ subjectsCount: subjectsCount }, ({grades, subjectsCount}) => eq(grades.id, subjectsCount.gradeId), 'left')
        .select(({grades, subjectsCount}) => ({
            ...grades,
            subjectsCount: subjectsCount?.count ?? 0,
        }))

        return q.from({ grades })
    }
})