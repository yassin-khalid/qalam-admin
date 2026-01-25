
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Badge } from "@/components/ui/badge"

interface Level {
    id: string
    name: string
    nameAr: string
    curriculum: string
    curriculumId: string
    active: boolean
    order: number
    gradesCount: number
}

const mockLevels: Level[] = [
    {
        id: "1",
        name: "Primary Education",
        nameAr: "التعليم الابتدائي",
        curriculum: "National Curriculum 2024",
        curriculumId: "1",
        active: true,
        order: 1,
        gradesCount: 6,
    },
    {
        id: "2",
        name: "Middle School",
        nameAr: "المرحلة المتوسطة",
        curriculum: "National Curriculum 2024",
        curriculumId: "1",
        active: true,
        order: 2,
        gradesCount: 3,
    },
    {
        id: "3",
        name: "Secondary Education",
        nameAr: "التعليم الثانوي",
        curriculum: "National Curriculum 2024",
        curriculumId: "1",
        active: true,
        order: 3,
        gradesCount: 3,
    },
    {
        id: "4",
        name: "Higher Secondary",
        nameAr: "الثانوية العليا",
        curriculum: "International Baccalaureate",
        curriculumId: "2",
        active: false,
        order: 4,
        gradesCount: 2,
    },
]

export default function LevelsPage() {
    const router = useRouter()
    const [levels, setLevels] = React.useState(mockLevels)
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; item: Level | null }>({
        open: false,
        item: null,
    })

    const columns: ColumnDef<Level>[] = [
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
            accessorKey: "curriculum",
            header: "Curriculum",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/20">
                    {row.original.curriculum}
                </Badge>
            ),
        },
        {
            accessorKey: "gradesCount",
            header: ({ column }) => <SortableHeader column={column} title="Grades" />,
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.gradesCount}</span>,
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
                    onView={() => router.push(`/levels/${row.original.id}`)}
                    onEdit={() => router.push(`/levels/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: row.original })}
                    onToggleStatus={() => {
                        setLevels((prev) =>
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
            setLevels((prev) => prev.filter((l) => l.id !== deleteDialog.item!.id))
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Education Levels" },
            ]}
        >
            <DataTable
                columns={columns}
                data={levels}
                title="Education Levels"
                searchKey="name"
                searchPlaceholder="Search levels..."
                filters={[
                    {
                        key: "curriculum",
                        label: "Curriculum",
                        options: [
                            { value: "National Curriculum 2024", label: "National Curriculum 2024" },
                            { value: "International Baccalaureate", label: "International Baccalaureate" },
                        ],
                    },
                ]}
                onAdd={() => router.push("/levels/new")}
                addButtonLabel="Add Level"
            />

            <DeleteDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: open ? deleteDialog.item : null })}
                title="Delete Level"
                itemName={deleteDialog.item?.name}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
