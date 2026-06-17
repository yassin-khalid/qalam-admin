
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, SortableHeader } from "@/components/admin/data-table"
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

export default function GradesPage() {
    const router = useRouter()
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

    // Grades are create + list only — no update/delete/toggle actions (CRUD guide §13).
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
    ]

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
                            ...(levels ?? []).map((level) => ({ value: locale === 'ar' ? level.nameAr : level.nameEn, label: locale === 'ar' ? level.nameAr : level.nameEn })),
                        ],
                    },
                ]}
                onAdd={() => router.push("/grades/new")}
                addButtonLabel="Add Grade"
            />
        </AdminLayout>
    )
}
