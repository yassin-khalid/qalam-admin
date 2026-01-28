
"use client"

import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { domainCollection } from "@/collections/domain"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { curriculumCollection } from "@/collections/curriculums"
import { useLocale } from "@/lib/locale-context"

// Mock data - in real app, this would come from API
const mockDomain = {
    id: "1",
    name: "Science & Technology",
    nameAr: "العلوم والتكنولوجيا",
    description: "All science and technology related subjects",
    descriptionAr: "جميع المواضيع المتعلقة بالعلوم والتكنولوجيا",
    active: true,
    order: 1,
}

const domainFields = [
    {
        key: "nameEn",
        label: "Domain Name",
        type: "text" as const,
        placeholder: "e.g. Science & Technology",
        required: true,
        section: "main" as const,
    },
    {
        key: "descriptionEn",
        label: "Description (EN)",
        type: "textarea" as const,
        placeholder: "Brief description of this domain...",
        section: "main" as const,
    },
    {
        key: "nameAr",
        label: "Domain Name",
        labelAr: "اسم المجال",
        type: "text" as const,
        placeholderAr: "مثال: العلوم والتكنولوجيا",
        required: true,
        section: "arabic" as const,
    },
    {
        key: "descriptionAr",
        label: "Description (AR)",
        labelAr: "الوصف",
        type: "textarea" as const,
        placeholderAr: "وصف مختصر للمجال...",
        section: "arabic" as const,
    },
    {
        key: "isActive",
        label: "Active Status",
        type: "switch" as const,
        section: "settings" as const,
    },
    {
        key: "orderIndex",
        label: "Display Order",
        type: "number" as const,
        placeholder: "1",
        section: "settings" as const,
    },
    {
        key: "code",
        label: "Code",
        type: "text" as const,
        placeholder: "123",
        section: "settings" as const,
        required: true,
    }
]

export default function EditDomainPage() {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const { locale } = useLocale()

    const handleSubmit = async (data: Record<string, any>) => {
        const transaction = domainCollection.update(
            parseInt(params.id),
            draft => {
                draft.nameEn = data.nameEn
                draft.descriptionEn = data.descriptionEn
                draft.nameAr = data.nameAr
                draft.descriptionAr = data.descriptionAr
                draft.code = data.code
            }
        )
        const persisted = await transaction.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/domains")
        } else if (persisted.state === "failed") {
            console.error(persisted.error?.message ?? "Failed to update domain")
        }
    }

    const { data: domain } = useLiveQuery(q => q.from({ domains: domainCollection })
        .where(({ domains }) => eq(domains.id, parseInt(params.id)))
        .findOne())


    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Education Domains", href: "/domains" },
                { label: locale === "ar" ? domain?.nameAr ?? '' : domain?.nameEn ?? '', href: `/domains/${params.id}` },
                { label: "Edit" },
            ]}
        >
            <EntityForm
                title={`Edit: ${locale === "ar" ? domain?.nameAr ?? '' : domain?.nameEn ?? ''}`}
                description="Update the education domain details"
                fields={domainFields}
                initialData={domain}
                onSubmit={handleSubmit}
                submitLabel="Save Changes"
                isEdit
            />
        </AdminLayout>
    )
}
