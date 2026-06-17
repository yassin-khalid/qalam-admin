"use client"

import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { unitCollection, type UnitTypeCode } from "@/collections/units"
import { subjectCollection } from "@/collections/subjects"
import { useLiveQuery } from "@tanstack/react-db"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

export default function NewUnitPage() {
    const router = useRouter()
    const { locale } = useLocale()
    const { data: subjects } = useLiveQuery(q => q.from({ subjects: subjectCollection }))

    const fields = [
        { key: "nameEn", label: "Name (EN)", type: "text" as const, placeholder: "e.g. Unit 1", required: true, section: "main" as const },
        {
            key: "subjectId", label: "Subject", type: "select" as const, required: true, section: "main" as const,
            options: (subjects ?? []).map(s => ({ value: String(s.id), label: locale === "ar" ? s.nameAr : s.nameEn })),
        },
        { key: "nameAr", label: "Name (AR)", type: "text" as const, placeholder: "مثال: الوحدة الأولى", required: true, section: "arabic" as const },
        {
            key: "unitTypeCode", label: "Unit Type", type: "select" as const, section: "settings" as const,
            options: [
                { value: "SchoolUnit", label: "School Unit" },
                { value: "LanguageModule", label: "Language Module" },
            ],
        },
        // SchoolUnit requires a termId (CRUD guide §10). Use the hierarchy manager for
        // term-bound or Quran units; this optional field lets you set it when known.
        { key: "termId", label: "Term ID (optional)", type: "number" as const, placeholder: "e.g. 1", section: "settings" as const },
        { key: "orderIndex", label: "Display Order", type: "number" as const, placeholder: "1", section: "settings" as const },
    ]

    const handleSubmit = async (data: Record<string, unknown>) => {
        if (!data.subjectId) {
            toast.error("Please select a subject")
            return
        }
        const result = unitCollection.insert({
            id: 0,
            subjectId: parseInt(data.subjectId as string),
            termId: data.termId ? Number(data.termId) : null,
            nameEn: data.nameEn as string,
            nameAr: data.nameAr as string,
            orderIndex: Number(data.orderIndex) || 1,
            unitTypeCode: ((data.unitTypeCode as UnitTypeCode) ?? "SchoolUnit"),
            isActive: true,
            createdAt: new Date().toISOString(),
        })
        const persisted = await result.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/units")
        } else if (persisted.state === "failed") {
            toast.error(persisted.error?.message ?? "Failed to create unit")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Units", href: "/units" },
                { label: "Create New" },
            ]}
        >
            <EntityForm
                title="Create Content Unit"
                description="Add a new unit under a subject"
                fields={fields}
                initialData={{ unitTypeCode: "SchoolUnit", orderIndex: 1 }}
                onSubmit={handleSubmit}
                submitLabel="Create Unit"
            />
        </AdminLayout>
    )
}
