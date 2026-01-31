import { queryClient } from "@/lib/utils";
import { ApiResponse, PaginatedResult } from "@/types/ApiResponse";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { count, createCollection, eq, liveQueryCollectionOptions } from "@tanstack/react-db";
import { curriculumCollection } from "./curriculums";

export type EducationDomainItem = {
  id: number;
  nameAr: string;
  nameEn: string;
  code: string;
  descriptionAr: string;
  descriptionEn: string;
  createdAt: string; // ISO date string
};

interface CurrentState {
    domainId: number | null
    curriculumId: number | null
    levelId: number | null
    gradeId: number | null
    termId: number | null
    subjectId: number | null
    quranContentTypeId: number | null
    quranLevelId: number | null
}

interface Rule {
    hasCurriculum: boolean
    hasEducationLevel: boolean
    hasGrade: boolean
    hasAcademicTerm: boolean
    hasContentUnits: boolean
    hasLessons: boolean
    requiresQuranContentType: boolean
    requiresQuranLevel: boolean
}

interface Option {
    id: number
    nameAr: string
    nameEn: string
    code: string | null
}

interface HierarchyData {
    currentState: CurrentState
    rule: Rule
    nextStep: string
    options: Option[]
}

export const domainCollection = createCollection(queryCollectionOptions({
    queryKey: () => ['domains'],
    queryFn: async (context) => {
        const locale = localStorage.getItem('locale') ?? 'ar'
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Domains`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
            },
        })
        if (!response.ok) {
            throw new Error('Failed to fetch domains')
        }
        const data: ApiResponse<PaginatedResult<EducationDomainItem>> = await response.json()
        return data.data.items
    },
    queryClient,
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
        const item = transaction.mutations[0].modified
        const locale = localStorage.getItem('locale') ?? 'ar'
        const accessToken = localStorage.getItem('access_token')
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Domains`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
                },
                body: JSON.stringify(item),
            })
            const data: ApiResponse<EducationDomainItem> = await response.json()
            if (!response.ok) {
                throw new Error(data.message)
            }
            return data.data as EducationDomainItem
        } catch (error) {
            throw error
        }
    },
    onUpdate: async ({transaction}) => {
        const item = transaction.mutations[0].modified
        const locale = localStorage.getItem('locale') ?? 'ar'
        const accessToken = localStorage.getItem('access_token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Domains/${item.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
            },
            body: JSON.stringify(item)
        })
        const data: ApiResponse<EducationDomainItem> = await response.json()
        if (!response.ok) {
            throw new Error(data.message)
        }
        return data.data as EducationDomainItem
    },
    onDelete: async ({transaction}) => {
        const item = transaction.mutations[0].modified
        const locale = localStorage.getItem('locale') ?? 'ar'
        const accessToken = localStorage.getItem('access_token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Domains/${item.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
            }
        })
        const data: ApiResponse<EducationDomainItem> = await response.json()
        if (!response.ok) {
            throw new Error(data.message)
        }
        return data.data as EducationDomainItem
    }
}))



export const domainWithCurriculumsCount = createCollection(liveQueryCollectionOptions({
    query: q => {
        const curriculumsCount = q.from({curriculums: curriculumCollection})
        .where(({curriculums}) => eq(curriculums.isActive, true))
        .groupBy(({curriculums}) => [
            curriculums.domainId,
        ])
        .select(({curriculums}) => ({
            domainId: curriculums.domainId,
            count: count(curriculums?.id ?? 0),
        }))


        const domains = q.from({domains: domainCollection})
        .join({curriculumsCount: curriculumsCount}, ({domains, curriculumsCount}) => eq(domains.id, curriculumsCount.domainId))
        .select(({domains, curriculumsCount}) => ({
            ...domains,
            name: domains.nameEn,
            curriculumsCount: curriculumsCount?.count ?? 0,
            active: true,
        }))
        return q.from({domains})
    }
}))


// export const domainHierarchy = createCollection(queryCollectionOptions({
//     queryKey: () => ['domain-hierarchy'],
//     queryFn: async () => {
//         const locale = localStorage.getItem('locale') ?? 'ar'
//         const accessToken = localStorage.getItem('access_token')
//         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/filter-options`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
//             }
//         })
//         const json = await response.json() as ApiResponse<HierarchyData>
//         if (!response.ok || !json.succeeded) {
//             throw new Error(json.message)
//         }
//         return json.data as HierarchyData
//     }
// }))