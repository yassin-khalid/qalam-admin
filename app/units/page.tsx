
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Badge } from "@/components/ui/badge"

interface Unit {
    id: string
    name: string
    nameAr: string
    subject: string
    subjectId: string
    active: boolean
    order: number
    lessonsCount: number
}

const mockUnits: Unit[] = [
    { id: "1", name: "Algebra Fundamentals", nameAr: "أساسيات الجبر", subject: "Mathematics", subjectId: "1", active: true, order: 1, lessonsCount: 12 },
    { id: "2", name: "Geometry Basics", nameAr: "أساسيات الهندسة", subject: "Mathematics", subjectId: "1", active: true, order: 2, lessonsCount: 10 },
    { id: "3", name: "Trigonometry", nameAr: "علم المثلثات", subject: "Mathematics", subjectId: "1", active: true, order: 3, lessonsCount: 8 },
    { id: "4", name: "Mechanics", nameAr: "الميكانيكا", subject: "Physics", subjectId: "2", active: true, order: 1, lessonsCount: 15 },
    { id: "5", name: "Thermodynamics", nameAr: "الديناميكا الحرارية", subject: "Physics", subjectId: "2", active: true, order: 2, lessonsCount: 10 },
    { id: "6", name: "Organic Chemistry", nameAr: "الكيمياء العضوية", subject: "Chemistry", subjectId: "3", active: false, order: 1, lessonsCount: 14 },
    { id: "7", name: "Cell Biology", nameAr: "بيولوجيا الخلية", subject: "Biology", subjectId: "4", active: true, order: 1, lessonsCount: 8 },
]

export default function UnitsPage() {
    const router = useRouter()
    const [units, setUnits] = React.useState(mockUnits)
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; item: Unit | null }>({
        open: false,
        item: null,
    })

    const columns: ColumnDef<Unit>[] = [
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
            accessorKey: "subject",
            header: "Subject",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-chart-5/10 text-chart-5 border-chart-5/20">
                    {row.original.subject}
                </Badge>
            ),
        },
        {
            accessorKey: "lessonsCount",
            header: ({ column }) => <SortableHeader column={column} title="Lessons" />,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.lessonsCount}</span>,
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
                    onView={() => router.push(`/units/${row.original.id}`)}
                    onEdit={() => router.push(`/units/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: row.original })}
                    onToggleStatus={() => {
                        setUnits((prev) =>
                            prev.map((u) =>
                                u.id === row.original.id ? { ...u, active: !u.active } : u
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
            setUnits((prev) => prev.filter((u) => u.id !== deleteDialog.item!.id))
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Units" },
            ]}
        >
            <DataTable
                columns={columns}
                data={units}
                title="Units"
                searchKey="name"
                searchPlaceholder="Search units..."
                filters={[
                    {
                        key: "subject",
                        label: "Subject",
                        options: [
                            { value: "Mathematics", label: "Mathematics" },
                            { value: "Physics", label: "Physics" },
                            { value: "Chemistry", label: "Chemistry" },
                            { value: "Biology", label: "Biology" },
                        ],
                    },
                ]}
                onAdd={() => router.push("/units/new")}
                addButtonLabel="Add Unit"
            />

            <DeleteDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: open ? deleteDialog.item : null })}
                title="Delete Unit"
                itemName={deleteDialog.item?.name}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
