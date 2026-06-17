
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, SortableHeader } from "@/components/admin/data-table"
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

export default function LevelsPage() {
    const router = useRouter()
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

    // Levels are create + list only — no update/delete/toggle actions (CRUD guide §13).
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
    ]

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
                            ...(curriculums ?? []).map((curriculum) => ({ value: locale === 'ar' ? curriculum.nameAr : curriculum.nameEn, label: locale === 'ar' ? curriculum.nameAr : curriculum.nameEn })),
                        ],
                    },
                ]}
                onAdd={() => router.push("/levels/new")}
                addButtonLabel="Add Level"
            />
        </AdminLayout>
    )
}
