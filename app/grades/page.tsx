
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Badge } from "@/components/ui/badge"

interface Grade {
    id: string
    name: string
    nameAr: string
    level: string
    levelId: string
    active: boolean
    order: number
    subjectsCount: number
}

const mockGrades: Grade[] = [
    { id: "1", name: "Grade 1", nameAr: "الصف الأول", level: "Primary Education", levelId: "1", active: true, order: 1, subjectsCount: 8 },
    { id: "2", name: "Grade 2", nameAr: "الصف الثاني", level: "Primary Education", levelId: "1", active: true, order: 2, subjectsCount: 8 },
    { id: "3", name: "Grade 3", nameAr: "الصف الثالث", level: "Primary Education", levelId: "1", active: true, order: 3, subjectsCount: 9 },
    { id: "4", name: "Grade 7", nameAr: "الصف السابع", level: "Middle School", levelId: "2", active: true, order: 7, subjectsCount: 10 },
    { id: "5", name: "Grade 8", nameAr: "الصف الثامن", level: "Middle School", levelId: "2", active: true, order: 8, subjectsCount: 10 },
    { id: "6", name: "Grade 10", nameAr: "الصف العاشر", level: "Secondary Education", levelId: "3", active: true, order: 10, subjectsCount: 12 },
    { id: "7", name: "Grade 11", nameAr: "الصف الحادي عشر", level: "Secondary Education", levelId: "3", active: false, order: 11, subjectsCount: 12 },
]

export default function GradesPage() {
    const router = useRouter()
    const [grades, setGrades] = React.useState(mockGrades)
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; item: Grade | null }>({
        open: false,
        item: null,
    })

    const columns: ColumnDef<Grade>[] = [
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
            accessorKey: "level",
            header: "Level",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-chart-3/10 text-chart-3 border-chart-3/20">
                    {row.original.level}
                </Badge>
            ),
        },
        {
            accessorKey: "subjectsCount",
            header: ({ column }) => <SortableHeader column={column} title="Subjects" />,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.subjectsCount}</span>,
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
                    onView={() => router.push(`/grades/${row.original.id}`)}
                    onEdit={() => router.push(`/grades/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: row.original })}
                    onToggleStatus={() => {
                        setGrades((prev) =>
                            prev.map((g) =>
                                g.id === row.original.id ? { ...g, active: !g.active } : g
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
            setGrades((prev) => prev.filter((g) => g.id !== deleteDialog.item!.id))
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Education Grades" },
            ]}
        >
            <DataTable
                columns={columns}
                data={grades}
                title="Education Grades"
                searchKey="name"
                searchPlaceholder="Search grades..."
                filters={[
                    {
                        key: "level",
                        label: "Level",
                        options: [
                            { value: "Primary Education", label: "Primary Education" },
                            { value: "Middle School", label: "Middle School" },
                            { value: "Secondary Education", label: "Secondary Education" },
                        ],
                    },
                ]}
                onAdd={() => router.push("/grades/new")}
                addButtonLabel="Add Grade"
            />

            <DeleteDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: open ? deleteDialog.item : null })}
                title="Delete Grade"
                itemName={deleteDialog.item?.name}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
