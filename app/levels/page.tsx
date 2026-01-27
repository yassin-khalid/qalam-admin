
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { levelWithGradesCount } from "@/collections/levels"
import { curriculumCollection } from "@/collections/curriculums"
import { useLocale } from "@/lib/locale-context"

interface Level {
    id: number
    nameEn: string
    nameAr: string
    curriculum: string
    curriculumId: number
    isActive: boolean
    orderIndex: number
    gradesCount: number
}

const mockLevels: Level[] = [
    {
        id: 1,
        nameEn: "Primary Education",
        nameAr: "التعليم الابتدائي",
        curriculum: "National Curriculum 2024",
        curriculumId: 1,
        isActive: true,
        orderIndex: 1,
        gradesCount: 6,
    },
    {
        id: 2,
        nameEn: "Middle School",
        nameAr: "المرحلة المتوسطة",
        curriculum: "National Curriculum 2024",
        curriculumId: 1,
        isActive: true,
        orderIndex: 2,
        gradesCount: 3,
    },
    {
        id: 3,
        nameEn: "Secondary Education",
        nameAr: "التعليم الثانوي",
        curriculum: "National Curriculum 2024",
        curriculumId: 1,
        isActive: true,
        orderIndex: 3,
        gradesCount: 3,
    },
    {
        id: 4,
        nameEn: "Higher Secondary",
        nameAr: "الثانوية العليا",
        curriculum: "International Baccalaureate",
        curriculumId: 2,
        isActive: false,
        orderIndex: 4,
        gradesCount: 2,
    },
]

export default function LevelsPage() {
    const router = useRouter()
    // const [levels, setLevels] = React.useState(mockLevels)
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; item: Level | null }>({
        open: false,
        item: null,
    })
    const { locale } = useLocale()

    const { data: levels } = useLiveQuery(q => q.from({ levels: levelWithGradesCount })
        .join({ curriculums: curriculumCollection }, ({ levels, curriculums }) => eq(levels.curriculumId, curriculums.id))
        .select(({ levels, curriculums }) => ({
            ...levels,
            curriculum: locale === 'ar' ? curriculums?.nameAr ?? '' : curriculums?.nameEn ?? '',
            curriculumId: curriculums?.id ?? 0,
        })), [locale]
    )

    const { data: curriculums } = useLiveQuery(q => q.from({ curriculums: curriculumCollection }))

    const columns: ColumnDef<Level>[] = [
        {
            accessorKey: "orderIndex",
            header: ({ column }) => <SortableHeader column={column} title="Order" />,
            cell: ({ row }) => (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-sm font-medium text-foreground">
                    {row.original.orderIndex}
                </div>
            ),
        },
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
            cell: ({ row }) => <StatusCell active={row.original.isActive} />,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <ActionsCell
                    onView={() => router.push(`/levels/${row.original.id}`)}
                    onEdit={() => router.push(`/levels/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: row.original })}
                    onToggleStatus={() => {
                        // setLevels((prev) =>
                        //     prev.map((l) =>
                        //         l.id === row.original.id ? { ...l, active: !l.active } : l
                        //     )
                        // )
                    }}
                    isActive={row.original.isActive}
                />
            ),
        },
    ]

    const handleDelete = async () => {
        // if (deleteDialog.item) {
        //     setLevels((prev) => prev.filter((l) => l.id !== deleteDialog.item!.id))
        // }
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
                searchKey={locale === 'ar' ? 'nameAr' : 'nameEn'}
                searchPlaceholder="Search levels..."
                filters={[
                    {
                        key: "curriculum",
                        label: "Curriculum",
                        options: [
                            // { value: "National Curriculum 2024", label: "National Curriculum 2024" },
                            // { value: "International Baccalaureate", label: "International Baccalaureate" },
                            ...curriculums?.map((curriculum) => ({ value: locale === 'ar' ? curriculum.nameAr : curriculum.nameEn, label: locale === 'ar' ? curriculum.nameAr : curriculum.nameEn })),
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
                itemName={deleteDialog.item?.nameEn}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
