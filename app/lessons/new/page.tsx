"use client"

import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { lessonCollection } from "@/collections/lessons"
import { unitCollection } from "@/collections/units"
import { useLiveQuery } from "@tanstack/react-db"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

export default function NewLessonPage() {
    const router = useRouter()
    const { locale } = useLocale()
    const { data: units } = useLiveQuery(q => q.from({ units: unitCollection }))

    const fields = [
        { key: "nameEn", label: "Name (EN)", type: "text" as const, placeholder: "e.g. Lesson 1", required: true, section: "main" as const },
        {
            key: "unitId", label: "Unit", type: "select" as const, required: true, section: "main" as const,
            options: (units ?? []).map(u => ({ value: String(u.id), label: locale === "ar" ? u.nameAr : u.nameEn })),
        },
        { key: "nameAr", label: "Name (AR)", type: "text" as const, placeholder: "مثال: الدرس الأول", required: true, section: "arabic" as const },
        { key: "orderIndex", label: "Display Order", type: "number" as const, placeholder: "1", section: "settings" as const },
    ]

    const handleSubmit = async (data: Record<string, unknown>) => {
        if (!data.unitId) {
            toast.error("Please select a unit")
            return
        }
        const result = lessonCollection.insert({
            id: 0,
            unitId: parseInt(data.unitId as string),
            nameEn: data.nameEn as string,
            nameAr: data.nameAr as string,
            orderIndex: Number(data.orderIndex) || 1,
            isActive: true,
            createdAt: new Date().toISOString(),
        })
        const persisted = await result.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/lessons")
        } else if (persisted.state === "failed") {
            toast.error(persisted.error?.message ?? "Failed to create lesson")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Lessons", href: "/lessons" },
                { label: "Create New" },
            ]}
        >
            <EntityForm
                title="Create Lesson"
                description="Add a new lesson under a unit"
                fields={fields}
                initialData={{ orderIndex: 1 }}
                onSubmit={handleSubmit}
                submitLabel="Create Lesson"
            />
        </AdminLayout>
    )
}
