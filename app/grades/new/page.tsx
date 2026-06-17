"use client"

import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { gradeCollection } from "@/collections/grades"
import { levelCollection } from "@/collections/levels"
import { useLiveQuery } from "@tanstack/react-db"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

export default function NewGradePage() {
    const router = useRouter()
    const { locale } = useLocale()
    const { data: levels } = useLiveQuery(q => q.from({ levels: levelCollection }))

    const fields = [
        { key: "nameEn", label: "Name (EN)", type: "text" as const, placeholder: "e.g. Grade 1", required: true, section: "main" as const },
        {
            key: "levelId", label: "Level", type: "select" as const, required: true, section: "main" as const,
            options: (levels ?? []).map(l => ({ value: String(l.id), label: locale === "ar" ? l.nameAr : l.nameEn })),
        },
        { key: "nameAr", label: "Name (AR)", type: "text" as const, placeholder: "مثال: الصف الأول", required: true, section: "arabic" as const },
        { key: "orderIndex", label: "Display Order", type: "number" as const, placeholder: "1", section: "settings" as const },
        { key: "active", label: "Active Status", type: "switch" as const, section: "settings" as const },
    ]

    const handleSubmit = async (data: Record<string, unknown>) => {
        if (!data.levelId) {
            toast.error("Please select a level")
            return
        }
        const result = gradeCollection.insert({
            id: 0,
            levelId: parseInt(data.levelId as string),
            nameEn: data.nameEn as string,
            nameAr: data.nameAr as string,
            orderIndex: Number(data.orderIndex) || 1,
            isActive: (data.active as boolean) ?? true,
            createdAt: new Date().toISOString(),
        })
        const persisted = await result.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/grades")
        } else if (persisted.state === "failed") {
            toast.error(persisted.error?.message ?? "Failed to create grade")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Education Grades", href: "/grades" },
                { label: "Create New" },
            ]}
        >
            <EntityForm
                title="Create Education Grade"
                description="Add a new grade under a level"
                fields={fields}
                initialData={{ active: true, orderIndex: 1 }}
                onSubmit={handleSubmit}
                submitLabel="Create Grade"
            />
        </AdminLayout>
    )
}
