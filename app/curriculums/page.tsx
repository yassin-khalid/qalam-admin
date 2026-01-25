
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Badge } from "@/components/ui/badge"

interface Curriculum {
    id: string
    name: string
    nameAr: string
    domain: string
    domainId: string
    active: boolean
    order: number
    levelsCount: number
    createdAt: string
}

const mockCurriculums: Curriculum[] = [
    {
        id: "1",
        name: "National Curriculum 2024",
        nameAr: "المنهج الوطني 2024",
        domain: "Science & Technology",
        domainId: "1",
        active: true,
        order: 1,
        levelsCount: 4,
        createdAt: "2024-01-15",
    },
    {
        id: "2",
        name: "International Baccalaureate",
        nameAr: "البكالوريا الدولية",
        domain: "Science & Technology",
        domainId: "1",
        active: true,
        order: 2,
        levelsCount: 3,
        createdAt: "2024-01-12",
    },
    {
        id: "3",
        name: "Advanced Placement",
        nameAr: "التنسيب المتقدم",
        domain: "Mathematics",
        domainId: "4",
        active: false,
        order: 3,
        levelsCount: 2,
        createdAt: "2024-01-10",
    },
    {
        id: "4",
        name: "Cambridge IGCSE",
        nameAr: "كامبريدج IGCSE",
        domain: "Languages",
        domainId: "3",
        active: true,
        order: 4,
        levelsCount: 5,
        createdAt: "2024-01-08",
    },
]

export default function CurriculumsPage() {
    const router = useRouter()
    const [curriculums, setCurriculums] = React.useState(mockCurriculums)
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; item: Curriculum | null }>({
        open: false,
        item: null,
    })

    const columns: ColumnDef<Curriculum>[] = [
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
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-foreground">{row.original.name}</p>
                </div>
            ),
        },
        {
            accessorKey: "nameAr",
            header: "Name (AR)",
            cell: ({ row }) => (
                <span dir="rtl" className="text-foreground">{row.original.nameAr}</span>
            ),
        },
        {
            accessorKey: "domain",
            header: "Domain",
            cell: ({ row }) => (
                <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">
                    {row.original.domain}
                </Badge>
            ),
        },
        {
            accessorKey: "levelsCount",
            header: ({ column }) => <SortableHeader column={column} title="Levels" />,
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.levelsCount}</span>
            ),
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
                    onView={() => router.push(`/curriculums/${row.original.id}`)}
                    onEdit={() => router.push(`/curriculums/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: row.original })}
                    onToggleStatus={() => {
                        setCurriculums((prev) =>
                            prev.map((c) =>
                                c.id === row.original.id ? { ...c, active: !c.active } : c
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
            setCurriculums((prev) => prev.filter((c) => c.id !== deleteDialog.item!.id))
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Curriculums" },
            ]}
        >
            <DataTable
                columns={columns}
                data={curriculums}
                title="Curriculums"
                searchKey="name"
                searchPlaceholder="Search curriculums..."
                filters={[
                    {
                        key: "domain",
                        label: "Domain",
                        options: [
                            { value: "Science & Technology", label: "Science & Technology" },
                            { value: "Mathematics", label: "Mathematics" },
                            { value: "Languages", label: "Languages" },
                        ],
                    },
                ]}
                onAdd={() => router.push("/curriculums/new")}
                addButtonLabel="Add Curriculum"
            />

            <DeleteDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, item: open ? deleteDialog.item : null })}
                title="Delete Curriculum"
                itemName={deleteDialog.item?.name}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
