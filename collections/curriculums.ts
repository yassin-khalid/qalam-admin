import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/react-db";
import { ApiResponse, PaginatedResult } from "@/types/ApiResponse";
import { queryClient } from "@/lib/utils";

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


