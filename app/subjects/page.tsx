
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Badge } from "@/components/ui/badge"

interface Subject {
    id: string
    name: string
    nameAr: string
    grade: string
    gradeId: string
    active: boolean
    order: number
    unitsCount: number
}

const mockSubjects: Subject[] = [
    { id: "1", name: "Mathematics", nameAr: "الرياضيات", grade: "Grade 10", gradeId: "6", active: true, order: 1, unitsCount: 8 },
    { id: "2", name: "Physics", nameAr: "الفيزياء", grade: "Grade 10", gradeId: "6", active: true, order: 2, unitsCount: 6 },
    { id: "3", name: "Chemistry", nameAr: "الكيمياء", grade: "Grade 10", gradeId: "6", active: true, order: 3, unitsCount: 7 },
    { id: "4", name: "Biology", nameAr: "الأحياء", grade: "Grade 10", gradeId: "6", active: true, order: 4, unitsCount: 5 },
    { id: "5", name: "English Language", nameAr: "اللغة الإنجليزية", grade: "Grade 10", gradeId: "6", active: true, order: 5, unitsCount: 10 },
    { id: "6", name: "Arabic Language", nameAr: "اللغة العربية", grade: "Grade 10", gradeId: "6", active: true, order: 6, unitsCount: 8 },
    { id: "7", name: "Computer Science", nameAr: "علوم الحاسوب", grade: "Grade 10", gradeId: "6", active: false, order: 7, unitsCount: 4 },
    { id: "8", name: "History", nameAr: "التاريخ", grade: "Grade 7", gradeId: "4", active: true, order: 8, unitsCount: 6 },
]

export default function SubjectsPage() {
    const router = useRouter()
    const [subjects, setSubjects] = React.useState(mockSubjects)
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; item: Subject | null }>({
        open: false,
        item: null,
    })

    const columns: ColumnDef<Subject>[] = [
        {
            accessorKey: "order",
            header: ({ column }) => <SortableHeader column={column} title="Order" />,
            cell: ({ row }) => (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-sm font-medium text-foreground">
                    {row.original.order}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => <SortableHeader column={column} title="Name (EN)" />,
            cell: ({ row }) => <span className="font-medium text-foreground">{row.original.name}</span>,
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
                <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                    {row.original.grade}
                </Badge>
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
            cell: ({ row }) => <StatusCell active={row.original.active} />,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <ActionsCell
                    onView={() => router.push(`/subjects/${row.original.id}`)}
                    onEdit={() => router.push(`/subjects/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: row.original })}
                    onToggleStatus={() => {
                        setSubjects((prev) =>
                            prev.map((s) =>
                                s.id === row.original.id ? { ...s, active: !s.active } : s
                            )
                        )
                    }}
                    isActive={row.original.active}
                />
            ),
        },
    ]

    const handleDelete = async () => {
        if (deleteDialog.item) {
            setSubjects((prev) => prev.filter((s) => s.id !== deleteDialog.item!.id))
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
                searchKey="name"
                searchPlaceholder="Search subjects..."
                filters={[
                    {
                        key: "grade",
                        label: "Grade",
                        options: [
                            { value: "Grade 7", label: "Grade 7" },
                            { value: "Grade 10", label: "Grade 10" },
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
                itemName={deleteDialog.item?.name}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
