import { queryClient } from "@/lib/utils";
import { ApiResponse, PaginatedResult } from "@/types/ApiResponse";
import { count, createCollection, createLiveQueryCollection, eq } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { unitCollection } from "./units";

export type SubjectItem = {
    id: number,
    domainId: number,
    curriculumId: number | null,
    levelId: number | null,
    gradeId: number | null,
    termId: number | null,
    nameAr: string,
    nameEn: string,
    descriptionAr: string,
    descriptionEn: string,
    isActive: boolean,
    createdAt: string,
}

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
    'Accept': 'application/json',
    'Accept-Language': localStorage.getItem('locale') === 'en' ? 'en-US' : 'ar-EG',
})

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
        // Tolerate both a direct array and a paginated { items: [...] } envelope.
        const data: ApiResponse<PaginatedResult<SubjectItem> | SubjectItem[]> = await response.json()
        return Array.isArray(data.data) ? data.data : data.data?.items ?? []
    },
    queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Subjects`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(item),
        })
        const data: ApiResponse<SubjectItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as SubjectItem
    },
    onUpdate: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Subjects/${item.id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(item),
        })
        const data: ApiResponse<SubjectItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as SubjectItem
    },
    onDelete: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Subjects/${item.id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        })
        const data: ApiResponse<SubjectItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as SubjectItem
    },
}))

export const subjectWithUnitsCount = createLiveQueryCollection({
    query: q => {
        const unitsCount = q.from({ units: unitCollection })
            .groupBy(({ units }) => units.subjectId)
            .select(({ units }) => ({
                subjectId: units.subjectId,
                count: count(units?.id ?? 0),
            }))

        const subjects = q.from({ subjects: subjectCollection })
            .join({ unitsCount }, ({ subjects, unitsCount }) => eq(subjects.id, unitsCount.subjectId), 'left')
            .select(({ subjects, unitsCount }) => ({
                ...subjects,
                unitsCount: unitsCount?.count ?? 0,
            }))

        return q.from({ subjects })
    }
})
