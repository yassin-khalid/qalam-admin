
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Badge } from "@/components/ui/badge"

interface Lesson {
    id: string
    name: string
    nameAr: string
    unit: string
    unitId: string
    subject: string
    active: boolean
    order: number
    duration: string
}

const mockLessons: Lesson[] = [
    { id: "1", name: "Introduction to Variables", nameAr: "مقدمة للمتغيرات", unit: "Algebra Fundamentals", unitId: "1", subject: "Mathematics", active: true, order: 1, duration: "45 min" },
    { id: "2", name: "Linear Equations", nameAr: "المعادلات الخطية", unit: "Algebra Fundamentals", unitId: "1", subject: "Mathematics", active: true, order: 2, duration: "50 min" },
    { id: "3", name: "Quadratic Equations", nameAr: "المعادلات التربيعية", unit: "Algebra Fundamentals", unitId: "1", subject: "Mathematics", active: true, order: 3, duration: "55 min" },
    { id: "4", name: "Points and Lines", nameAr: "النقاط والخطوط", unit: "Geometry Basics", unitId: "2", subject: "Mathematics", active: true, order: 1, duration: "40 min" },
    { id: "5", name: "Triangles", nameAr: "المثلثات", unit: "Geometry Basics", unitId: "2", subject: "Mathematics", active: true, order: 2, duration: "45 min" },
    { id: "6", name: "Newton's Laws", nameAr: "قوانين نيوتن", unit: "Mechanics", unitId: "4", subject: "Physics", active: true, order: 1, duration: "60 min" },
    { id: "7", name: "Forces and Motion", nameAr: "القوى والحركة", unit: "Mechanics", unitId: "4", subject: "Physics", active: false, order: 2, duration: "55 min" },
    { id: "8", name: "Work and Energy", nameAr: "الشغل والطاقة", unit: "Mechanics", unitId: "4", subject: "Physics", active: true, order: 3, duration: "50 min" },
]

export default function LessonsPage() {
    const router = useRouter()
    const [lessons, setLessons] = React.useState(mockLessons)
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; item: Lesson | null }>({
        open: false,
        item: null,
    })

    const columns: ColumnDef<Lesson>[] = [
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
            accessorKey: "unit",
            header: "Unit",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                    {row.original.unit}
                </Badge>
            ),
        },
        {
            accessorKey: "subject",
            header: "Subject",
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.subject}</span>
            ),
        },
        {
            accessorKey: "duration",
            header: "Duration",
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.duration}</span>,
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
                    onView={() => router.push(`/lessons/${row.original.id}`)}
                    onEdit={() => router.push(`/lessons/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: row.original })}
                    onToggleStatus={() => {
                        setLessons((prev) =>
                            prev.map((l) =>
                                l.id === row.original.id ? { ...l, active: !l.active } : l
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
            setLessons((prev) => prev.filter((l) => l.id !== deleteDialog.item!.id))
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Lessons" },
            ]}
        >
            <DataTable
                columns={columns}
                data={lessons}
                title="Lessons"
                searchKey="name"
                searchPlaceholder="Search lessons..."
                filters={[
                    {
                        key: "subject",
                        label: "Subject",
                        options: [
                            { value: "Mathematics", label: "Mathematics" },
                            { value: "Physics", label: "Physics" },
                        ],
                    },
                    {
                        key: "unit",
                        label: "Unit",
                        options: [
                            { value: "Algebra Fundamentals", label: "Algebra Fundamentals" },
                            { value: "Geometry Basics", label: "Geometry Basics" },
                            { value: "Mechanics", label: "Mechanics" },
                        ],
                    },
                ]}
                onAdd={() => router.push("/lessons/new")}
                addButtonLabel="Add Lesson"
            />

            <DeleteDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: open ? deleteDialog.item : null })}
                title="Delete Lesson"
                itemName={deleteDialog.item?.name}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
