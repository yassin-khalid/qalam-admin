"use client"

import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { curriculumCollection } from "@/collections/curriculums"
import { domainCollection } from "@/collections/domain"
import { useLiveQuery } from "@tanstack/react-db"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

export default function NewCurriculumPage() {
    const router = useRouter()
    const { locale } = useLocale()
    const { data: domains } = useLiveQuery(q => q.from({ domains: domainCollection }))

    const fields = [
        { key: "nameEn", label: "Name (EN)", type: "text" as const, placeholder: "e.g. Saudi Curriculum", required: true, section: "main" as const },
        {
            key: "domainId", label: "Domain", type: "select" as const, required: true, section: "main" as const,
            options: (domains ?? []).map(d => ({ value: String(d.id), label: locale === "ar" ? d.nameAr : d.nameEn })),
        },
        { key: "descriptionEn", label: "Description (EN)", type: "textarea" as const, section: "main" as const },
        { key: "nameAr", label: "Name (AR)", type: "text" as const, placeholder: "مثال: المنهج السعودي", required: true, section: "arabic" as const },
        { key: "descriptionAr", label: "Description (AR)", type: "textarea" as const, section: "arabic" as const },
        { key: "country", label: "Country", type: "text" as const, placeholder: "SA", section: "settings" as const },
        { key: "active", label: "Active Status", type: "switch" as const, section: "settings" as const },
    ]

    const handleSubmit = async (data: Record<string, unknown>) => {
        if (!data.domainId) {
            toast.error("Please select a domain")
            return
        }
        const result = curriculumCollection.insert({
            id: 0,
            nameEn: data.nameEn as string,
            nameAr: data.nameAr as string,
            domainId: parseInt(data.domainId as string),
            country: (data.country as string) ?? "",
            descriptionEn: (data.descriptionEn as string) ?? "",
            descriptionAr: (data.descriptionAr as string) ?? "",
            isActive: (data.active as boolean) ?? true,
            createdAt: new Date().toISOString(),
        })
        const persisted = await result.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/curriculums")
        } else if (persisted.state === "failed") {
            toast.error(persisted.error?.message ?? "Failed to create curriculum")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Curriculums", href: "/curriculums" },
                { label: "Create New" },
            ]}
        >
            <EntityForm
                title="Create Curriculum"
                description="Add a new curriculum under a domain"
                fields={fields}
                initialData={{ active: true }}
                onSubmit={handleSubmit}
                submitLabel="Create Curriculum"
            />
        </AdminLayout>
    )
}
