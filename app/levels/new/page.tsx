"use client"

import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { levelCollection } from "@/collections/levels"
import { curriculumCollection } from "@/collections/curriculums"
import { useLiveQuery } from "@tanstack/react-db"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

export default function NewLevelPage() {
    const router = useRouter()
    const { locale } = useLocale()
    const { data: curriculums } = useLiveQuery(q => q.from({ curriculums: curriculumCollection }))

    const fields = [
        { key: "nameEn", label: "Name (EN)", type: "text" as const, placeholder: "e.g. Primary", required: true, section: "main" as const },
        {
            key: "curriculumId", label: "Curriculum", type: "select" as const, required: true, section: "main" as const,
            options: (curriculums ?? []).map(c => ({ value: String(c.id), label: locale === "ar" ? c.nameAr : c.nameEn })),
        },
        { key: "nameAr", label: "Name (AR)", type: "text" as const, placeholder: "مثال: المرحلة الابتدائية", required: true, section: "arabic" as const },
        { key: "orderIndex", label: "Display Order", type: "number" as const, placeholder: "1", section: "settings" as const },
        { key: "active", label: "Active Status", type: "switch" as const, section: "settings" as const },
    ]

    const handleSubmit = async (data: Record<string, unknown>) => {
        const curriculumId = data.curriculumId ? parseInt(data.curriculumId as string) : 0
        const curriculum = (curriculums ?? []).find(c => c.id === curriculumId)
        if (!curriculum) {
            toast.error("Please select a curriculum")
            return
        }
        const result = levelCollection.insert({
            id: 0,
            domainId: curriculum.domainId,
            curriculumId,
            nameEn: data.nameEn as string,
            nameAr: data.nameAr as string,
            orderIndex: Number(data.orderIndex) || 1,
            isActive: (data.active as boolean) ?? true,
            createdAt: new Date().toISOString(),
        })
        const persisted = await result.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/levels")
        } else if (persisted.state === "failed") {
            toast.error(persisted.error?.message ?? "Failed to create level")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Education Levels", href: "/levels" },
                { label: "Create New" },
            ]}
        >
            <EntityForm
                title="Create Education Level"
                description="Add a new level under a curriculum"
                fields={fields}
                initialData={{ active: true, orderIndex: 1 }}
                onSubmit={handleSubmit}
                submitLabel="Create Level"
            />
        </AdminLayout>
    )
}
