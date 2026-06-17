"use client"

import { useRouter } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { subjectCollection } from "@/collections/subjects"
import { gradeCollection } from "@/collections/grades"
import { levelCollection } from "@/collections/levels"
import { curriculumCollection } from "@/collections/curriculums"
import { useLiveQuery } from "@tanstack/react-db"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

export default function NewSubjectPage() {
    const router = useRouter()
    const { locale } = useLocale()
    const { data: grades } = useLiveQuery(q => q.from({ grades: gradeCollection }))
    const { data: levels } = useLiveQuery(q => q.from({ levels: levelCollection }))
    const { data: curriculums } = useLiveQuery(q => q.from({ curriculums: curriculumCollection }))

    const fields = [
        { key: "nameEn", label: "Name (EN)", type: "text" as const, placeholder: "e.g. Mathematics", required: true, section: "main" as const },
        {
            key: "gradeId", label: "Grade", type: "select" as const, required: true, section: "main" as const,
            options: (grades ?? []).map(g => ({ value: String(g.id), label: locale === "ar" ? g.nameAr : g.nameEn })),
        },
        { key: "descriptionEn", label: "Description (EN)", type: "textarea" as const, section: "main" as const },
        { key: "nameAr", label: "Name (AR)", type: "text" as const, placeholder: "مثال: رياضيات", required: true, section: "arabic" as const },
        { key: "descriptionAr", label: "Description (AR)", type: "textarea" as const, section: "arabic" as const },
        { key: "active", label: "Active Status", type: "switch" as const, section: "settings" as const },
    ]

    const handleSubmit = async (data: Record<string, unknown>) => {
        const gradeId = data.gradeId ? parseInt(data.gradeId as string) : null
        const grade = (grades ?? []).find(g => g.id === gradeId)
        if (!grade) {
            toast.error("Please select a grade")
            return
        }
        // Derive the rest of the hierarchy from the chosen grade (domainId is required).
        const level = (levels ?? []).find(l => l.id === grade.levelId)
        const curriculum = (curriculums ?? []).find(c => c.id === level?.curriculumId)
        const domainId = level?.domainId ?? curriculum?.domainId
        if (!domainId) {
            toast.error("Could not resolve the domain for this grade")
            return
        }
        const result = subjectCollection.insert({
            id: 0,
            domainId,
            curriculumId: level?.curriculumId ?? null,
            levelId: grade.levelId ?? null,
            gradeId,
            termId: null,
            nameEn: data.nameEn as string,
            nameAr: data.nameAr as string,
            descriptionEn: (data.descriptionEn as string) ?? "",
            descriptionAr: (data.descriptionAr as string) ?? "",
            isActive: (data.active as boolean) ?? true,
            createdAt: new Date().toISOString(),
        })
        const persisted = await result.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/subjects")
        } else if (persisted.state === "failed") {
            toast.error(persisted.error?.message ?? "Failed to create subject")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Subjects", href: "/subjects" },
                { label: "Create New" },
            ]}
        >
            <EntityForm
                title="Create Subject"
                description="Add a new subject under a grade"
                fields={fields}
                initialData={{ active: true }}
                onSubmit={handleSubmit}
                submitLabel="Create Subject"
            />
        </AdminLayout>
    )
}
