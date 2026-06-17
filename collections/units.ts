import { queryClient } from "@/lib/utils";
import { ApiResponse, PaginatedResult } from "@/types/ApiResponse";
import { count, createCollection, createLiveQueryCollection, eq } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { lessonCollection } from "./lessons";

export type UnitTypeCode = "SchoolUnit" | "LanguageModule" | "QuranSurah" | "QuranPart";

export type UnitItem = {
    id: number,
    subjectId: number,
    termId: number | null,
    nameAr: string,
    nameEn: string,
    orderIndex: number,
    unitTypeCode: UnitTypeCode,
    isActive: boolean,
    createdAt: string,
}

// Content units are create + list only (no update/delete REST API — see CRUD guide §10/§13).
export const unitCollection = createCollection(queryCollectionOptions({
    queryKey: () => ['units'],
    queryFn: async () => {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Content/Units`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            }
        })
        if (!response.ok) {
            throw new Error('Failed to fetch units')
        }
        // Tolerate both a direct array and a paginated { items: [...] } envelope.
        const data: ApiResponse<PaginatedResult<UnitItem> | UnitItem[]> = await response.json()
        return Array.isArray(data.data) ? data.data : data.data?.items ?? []
    },
    queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Content/Units`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Accept': 'application/json',
                'Accept-Language': localStorage.getItem('locale') === 'en' ? 'en-US' : 'ar-EG',
            },
            body: JSON.stringify(item),
        })
        const data: ApiResponse<UnitItem> = await response.json()
        if (!response.ok) throw new Error(data.message)
        return data.data as UnitItem
    },
}))

export const unitWithLessonsCount = createLiveQueryCollection({
    query: q => {
        const lessonsCount = q.from({ lessons: lessonCollection })
            .groupBy(({ lessons }) => lessons.unitId)
            .select(({ lessons }) => ({
                unitId: lessons.unitId,
                count: count(lessons?.id ?? 0),
            }))

        const units = q.from({ units: unitCollection })
            .join({ lessonsCount }, ({ units, lessonsCount }) => eq(units.id, lessonsCount.unitId), 'left')
            .select(({ units, lessonsCount }) => ({
                ...units,
                lessonsCount: lessonsCount?.count ?? 0,
            }))

        return q.from({ units })
    }
})
