
"use client"

import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { domainCollection } from "@/collections/domain"
import { useLocale } from "@/lib/locale-context"

const domainFields = [
    {
        key: "name",
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
        key: "active",
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

export default function NewDomainPage() {
    const router = useRouter()
    const { locale } = useLocale()

    const handleSubmit = async (data: Record<string, any>) => {
        const result = domainCollection.insert(
            {
                nameEn: data.name,
                descriptionEn: data.descriptionEn,
                nameAr: data.nameAr,
                descriptionAr: data.descriptionAr,
                code: data.code || "123",
                createdAt: new Date().toISOString(),
                id: 0,
            },
        )
        const persisted = await result.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/domains")
        } else if (persisted.state === "failed") {
            console.error(persisted.error?.message ?? "Failed to create domain")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Education Domains", href: "/domains" },
                { label: "Create New" },
            ]}
        >
            <EntityForm
                title="Create Education Domain"
                description="Add a new education domain to the system"
                fields={domainFields}
                initialData={{ active: true, order: 1 }}
                onSubmit={handleSubmit}
                submitLabel="Create Domain"
            />
        </AdminLayout>
    )
}
