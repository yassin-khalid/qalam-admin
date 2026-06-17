"use client"

import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { curriculumCollection } from "@/collections/curriculums"
import { domainCollection } from "@/collections/domain"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

export default function EditCurriculumPage() {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const { locale } = useLocale()

    const { data: domains } = useLiveQuery(q => q.from({ domains: domainCollection }))
    const { data: curriculum } = useLiveQuery(q => q.from({ curriculums: curriculumCollection })
        .where(({ curriculums }) => eq(curriculums.id, parseInt(params.id)))
        .findOne())

    const fields = [
        { key: "nameEn", label: "Name (EN)", type: "text" as const, required: true, section: "main" as const },
        {
            key: "domainId", label: "Domain", type: "select" as const, required: true, section: "main" as const,
            options: (domains ?? []).map(d => ({ value: String(d.id), label: locale === "ar" ? d.nameAr : d.nameEn })),
        },
        { key: "descriptionEn", label: "Description (EN)", type: "textarea" as const, section: "main" as const },
        { key: "nameAr", label: "Name (AR)", type: "text" as const, required: true, section: "arabic" as const },
        { key: "descriptionAr", label: "Description (AR)", type: "textarea" as const, section: "arabic" as const },
        { key: "country", label: "Country", type: "text" as const, section: "settings" as const },
        { key: "active", label: "Active Status", type: "switch" as const, section: "settings" as const },
    ]

    const handleSubmit = async (data: Record<string, unknown>) => {
        const tx = curriculumCollection.update(parseInt(params.id), draft => {
            draft.nameEn = data.nameEn as string
            draft.nameAr = data.nameAr as string
            draft.domainId = parseInt(data.domainId as string)
            draft.country = (data.country as string) ?? ""
            draft.descriptionEn = (data.descriptionEn as string) ?? ""
            draft.descriptionAr = (data.descriptionAr as string) ?? ""
            draft.isActive = (data.active as boolean) ?? true
        })
        const persisted = await tx.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/curriculums")
        } else if (persisted.state === "failed") {
            toast.error(persisted.error?.message ?? "Failed to update curriculum")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Curriculums", href: "/curriculums" },
                { label: locale === "ar" ? curriculum?.nameAr ?? "" : curriculum?.nameEn ?? "" },
                { label: "Edit" },
            ]}
        >
            {curriculum && (
                <EntityForm
                    title={`Edit: ${locale === "ar" ? curriculum.nameAr : curriculum.nameEn}`}
                    description="Update the curriculum details"
                    fields={fields}
                    initialData={{
                        nameEn: curriculum.nameEn,
                        nameAr: curriculum.nameAr,
                        domainId: String(curriculum.domainId),
                        descriptionEn: curriculum.descriptionEn,
                        descriptionAr: curriculum.descriptionAr,
                        country: curriculum.country,
                        active: curriculum.isActive,
                    }}
                    onSubmit={handleSubmit}
                    submitLabel="Save Changes"
                    isEdit
                />
            )}
        </AdminLayout>
    )
}
