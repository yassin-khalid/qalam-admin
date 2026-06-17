
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { subjectCollection, subjectWithUnitsCount } from "@/collections/subjects"
import { gradeCollection } from "@/collections/grades"
import { useLocale } from "@/lib/locale-context"
import { toast } from "sonner"

interface Subject {
    id: number
    nameEn: string
    nameAr: string
    grade: string
    gradeId: number | null
    isActive: boolean
    unitsCount: number
}

export default function SubjectsPage() {
    const router = useRouter()
    const { locale } = useLocale()
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; item: Subject | null }>({
        open: false,
        item: null,
    })

    const { data: subjects } = useLiveQuery(q => q.from({ subjects: subjectWithUnitsCount })
        .join({ grades: gradeCollection }, ({ subjects, grades }) => eq(subjects.gradeId, grades.id), 'left')
        .select(({ subjects, grades }) => ({
            ...subjects,
            grade: locale === 'ar' ? grades?.nameAr ?? '' : grades?.nameEn ?? '',
        })), [locale]
    )

    const { data: grades } = useLiveQuery(q => q.from({ grades: gradeCollection }))

    const columns: ColumnDef<Subject>[] = [
        {
            accessorKey: "nameEn",
            header: ({ column }) => <SortableHeader column={column} title="Name (EN)" />,
            cell: ({ row }) => <span className="font-medium text-foreground">{row.original.nameEn}</span>,
        },
        {
            accessorKey: "nameAr",
            header: "Name (AR)",
            cell: ({ row }) => <span dir="rtl" className="text-foreground">{row.original.nameAr}</span>,
        },
        {
            accessorKey: "grade",
            header: "Grade",
            cell: ({ row }) => (
                row.original.grade
                    ? <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">{row.original.grade}</Badge>
                    : <span className="text-muted-foreground">—</span>
            ),
        },
        {
            accessorKey: "unitsCount",
            header: ({ column }) => <SortableHeader column={column} title="Units" />,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.unitsCount}</span>,
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => <StatusCell active={row.original.isActive} />,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <ActionsCell
                    onEdit={() => router.push(`/subjects/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: row.original })}
                    onToggleStatus={() => {
                        // Subjects have no toggle endpoint; flip isActive via PUT update.
                        const tx = subjectCollection.update(row.original.id, draft => {
                            draft.isActive = !row.original.isActive
                        })
                        tx.isPersisted.promise.then(result => {
                            if (result.state === "failed") {
                                toast.error(result.error?.message ?? "Failed to update subject")
                            }
                        })
                    }}
                    isActive={row.original.isActive}
                />
            ),
        },
    ]

    const handleDelete = async () => {
        if (deleteDialog.item) {
            const tx = subjectCollection.delete(deleteDialog.item.id)
            tx.isPersisted.promise.then(result => {
                if (result.state === "completed") {
                    setDeleteDialog({ open: false, item: null })
                }
                if (result.state === "failed") {
                    // e.g. 400 "Cannot delete subject with existing content units"
                    toast.error(result.error?.message ?? "Failed to delete subject")
                }
            })
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Subjects" },
            ]}
        >
            <DataTable
                columns={columns}
                data={subjects}
                title="Subjects"
                searchKey={locale === 'ar' ? 'nameAr' : 'nameEn'}
                searchPlaceholder="Search subjects..."
                filters={[
                    {
                        key: "grade",
                        label: "Grade",
                        options: [
                            ...(grades ?? []).map((grade) => ({ value: locale === 'ar' ? grade.nameAr : grade.nameEn, label: locale === 'ar' ? grade.nameAr : grade.nameEn })),
                        ],
                    },
                ]}
                onAdd={() => router.push("/subjects/new")}
                addButtonLabel="Add Subject"
            />

            <DeleteDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: open ? deleteDialog.item : null })}
                title="Delete Subject"
                itemName={locale === 'ar' ? deleteDialog.item?.nameAr : deleteDialog.item?.nameEn}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
