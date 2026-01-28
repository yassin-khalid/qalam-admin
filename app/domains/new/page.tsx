
"use client"

import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"

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
        key: "description",
        label: "Description",
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
        label: "Description",
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
        key: "order",
        label: "Display Order",
        type: "number" as const,
        placeholder: "1",
        section: "settings" as const,
    },
]

export default function NewDomainPage() {
    const router = useRouter()

    const handleSubmit = async (data: Record<string, any>) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log("Creating domain:", data)
        router.push("/domains")
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
