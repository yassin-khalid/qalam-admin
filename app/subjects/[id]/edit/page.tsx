"use client"

import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { EntityForm } from "@/components/admin/entity-form"
import { subjectCollection } from "@/collections/subjects"
import { gradeCollection } from "@/collections/grades"
import { levelCollection } from "@/collections/levels"
import { curriculumCollection } from "@/collections/curriculums"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

export default function EditSubjectPage() {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const { locale } = useLocale()

    const { data: grades } = useLiveQuery(q => q.from({ grades: gradeCollection }))
    const { data: levels } = useLiveQuery(q => q.from({ levels: levelCollection }))
    const { data: curriculums } = useLiveQuery(q => q.from({ curriculums: curriculumCollection }))
    const { data: subject } = useLiveQuery(q => q.from({ subjects: subjectCollection })
        .where(({ subjects }) => eq(subjects.id, parseInt(params.id)))
        .findOne())

    const fields = [
        { key: "nameEn", label: "Name (EN)", type: "text" as const, required: true, section: "main" as const },
        {
            key: "gradeId", label: "Grade", type: "select" as const, required: true, section: "main" as const,
            options: (grades ?? []).map(g => ({ value: String(g.id), label: locale === "ar" ? g.nameAr : g.nameEn })),
        },
        { key: "descriptionEn", label: "Description (EN)", type: "textarea" as const, section: "main" as const },
        { key: "nameAr", label: "Name (AR)", type: "text" as const, required: true, section: "arabic" as const },
        { key: "descriptionAr", label: "Description (AR)", type: "textarea" as const, section: "arabic" as const },
        { key: "active", label: "Active Status", type: "switch" as const, section: "settings" as const },
    ]

    const handleSubmit = async (data: Record<string, unknown>) => {
        const gradeId = data.gradeId ? parseInt(data.gradeId as string) : null
        const grade = (grades ?? []).find(g => g.id === gradeId)
        const level = (levels ?? []).find(l => l.id === grade?.levelId)
        const curriculum = (curriculums ?? []).find(c => c.id === level?.curriculumId)
        const domainId = level?.domainId ?? curriculum?.domainId

        const tx = subjectCollection.update(parseInt(params.id), draft => {
            draft.nameEn = data.nameEn as string
            draft.nameAr = data.nameAr as string
            draft.descriptionEn = (data.descriptionEn as string) ?? ""
            draft.descriptionAr = (data.descriptionAr as string) ?? ""
            draft.isActive = (data.active as boolean) ?? true
            if (gradeId) {
                draft.gradeId = gradeId
                draft.levelId = grade?.levelId ?? null
                draft.curriculumId = level?.curriculumId ?? null
                if (domainId) draft.domainId = domainId
            }
        })
        const persisted = await tx.isPersisted.promise
        if (persisted.state === "completed") {
            router.push("/subjects")
        } else if (persisted.state === "failed") {
            toast.error(persisted.error?.message ?? "Failed to update subject")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Subjects", href: "/subjects" },
                { label: locale === "ar" ? subject?.nameAr ?? "" : subject?.nameEn ?? "" },
                { label: "Edit" },
            ]}
        >
            {subject && (
                <EntityForm
                    title={`Edit: ${locale === "ar" ? subject.nameAr : subject.nameEn}`}
                    description="Update the subject details"
                    fields={fields}
                    initialData={{
                        nameEn: subject.nameEn,
                        nameAr: subject.nameAr,
                        gradeId: subject.gradeId != null ? String(subject.gradeId) : "",
                        descriptionEn: subject.descriptionEn,
                        descriptionAr: subject.descriptionAr,
                        active: subject.isActive,
                    }}
                    onSubmit={handleSubmit}
                    submitLabel="Save Changes"
                    isEdit
                />
            )}
        </AdminLayout>
    )
}
