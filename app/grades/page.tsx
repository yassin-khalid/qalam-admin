
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { Badge } from "@/components/ui/badge"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { gradeWithSubjectsCount } from "@/collections/grades"
import { levelCollection } from "@/collections/levels"
import { useLocale } from "@/lib/locale-context"

interface Grade {
    id: number
    nameEn: string
    nameAr: string
    level: string
    levelId: number
    isActive: boolean
    orderIndex: number
    subjectsCount: number
}

const mockGrades: Grade[] = [
    { id: 1, nameEn: "Grade 1", nameAr: "الصف الأول", level: "Primary Education", levelId: 1, isActive: true, orderIndex: 1, subjectsCount: 8 },
    { id: 2, nameEn: "Grade 2", nameAr: "الصف الثاني", level: "Primary Education", levelId: 1, isActive: true, orderIndex: 2, subjectsCount: 8 },
    { id: 3, nameEn: "Grade 3", nameAr: "الصف الثالث", level: "Primary Education", levelId: 1, isActive: true, orderIndex: 3, subjectsCount: 9 },
    { id: 4, nameEn: "Grade 7", nameAr: "الصف السابع", level: "Middle School", levelId: 2, isActive: true, orderIndex: 7, subjectsCount: 10 },
    { id: 5, nameEn: "Grade 8", nameAr: "الصف الثامن", level: "Middle School", levelId: 2, isActive: true, orderIndex: 8, subjectsCount: 10 },
    { id: 6, nameEn: "Grade 10", nameAr: "الصف العاشر", level: "Secondary Education", levelId: 3, isActive: true, orderIndex: 10, subjectsCount: 12 },
    { id: 7, nameEn: "Grade 11", nameAr: "الصف الحادي عشر", level: "Secondary Education", levelId: 3, isActive: false, orderIndex: 11, subjectsCount: 12 },
]

export default function GradesPage() {
    const router = useRouter()
    // const [grades, setGrades] = React.useState(mockGrades)
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; item: Grade | null }>({
        open: false,
        item: null,
    })
    const { locale } = useLocale()

    const { data: grades } = useLiveQuery(q => q.from({ grades: gradeWithSubjectsCount })
        .join({ levels: levelCollection }, ({ grades, levels }) => eq(grades.levelId, levels.id))
        .select(({ grades, levels }) => ({
            ...grades,
            level: locale === 'ar' ? levels?.nameAr ?? '' : levels?.nameEn ?? '',
            levelId: levels?.id ?? 0,
        })), [locale]
    )

    const { data: levels } = useLiveQuery(q => q.from({ levels: levelCollection }))

    const columns: ColumnDef<Grade>[] = [
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
            cell: ({ row }) => <StatusCell active={row.original.isActive} />,
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <ActionsCell
                    onView={() => router.push(`/grades/${row.original.id}`)}
                    onEdit={() => router.push(`/grades/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: row.original })}
                    onToggleStatus={() => {
                        // setGrades((prev) =>
                        //     prev.map((g) =>
                        //         g.id === row.original.id ? { ...g, active: !g.active } : g
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
        //     setGrades((prev) => prev.filter((g) => g.id !== deleteDialog.item!.id))
        // }
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
                searchKey={locale === 'ar' ? 'nameAr' : 'nameEn'}
                searchPlaceholder="Search grades..."
                filters={[
                    {
                        key: "level",
                        label: "Level",
                        options: [
                            // { value: "Primary Education", label: "Primary Education" },
                            // { value: "Middle School", label: "Middle School" },
                            // { value: "Secondary Education", label: "Secondary Education" },
                            ...levels?.map((level) => ({ value: locale === 'ar' ? level.nameAr : level.nameEn, label: locale === 'ar' ? level.nameAr : level.nameEn })),
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
                itemName={deleteDialog.item?.nameEn}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
