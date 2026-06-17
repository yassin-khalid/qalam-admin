
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, SortableHeader } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { lessonCollection } from "@/collections/lessons"
import { unitCollection } from "@/collections/units"
import { subjectCollection } from "@/collections/subjects"
import { useLocale } from "@/lib/locale-context"

interface Lesson {
    id: number
    nameEn: string
    nameAr: string
    unit: string
    unitId: number
    subject: string
    orderIndex: number
    isActive: boolean
}

export default function LessonsPage() {
    const router = useRouter()
    const { locale } = useLocale()

    const { data: lessons } = useLiveQuery(q => q.from({ lessons: lessonCollection })
        .join({ units: unitCollection }, ({ lessons, units }) => eq(lessons.unitId, units.id), 'left')
        .join({ subjects: subjectCollection }, ({ units, subjects }) => eq(units?.subjectId, subjects.id), 'left')
        .select(({ lessons, units, subjects }) => ({
            ...lessons,
            unit: locale === 'ar' ? units?.nameAr ?? '' : units?.nameEn ?? '',
            subject: locale === 'ar' ? subjects?.nameAr ?? '' : subjects?.nameEn ?? '',
        })), [locale]
    )

    const { data: units } = useLiveQuery(q => q.from({ units: unitCollection }))
    const { data: subjects } = useLiveQuery(q => q.from({ subjects: subjectCollection }))

    // Lessons are create + list only — no update/delete/toggle actions (CRUD guide §13).
    const columns: ColumnDef<Lesson>[] = [
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
            accessorKey: "unit",
            header: "Unit",
            cell: ({ row }) => (
                row.original.unit
                    ? <Badge variant="outline" className="bg-chart-1/10 text-chart-1 border-chart-1/20">{row.original.unit}</Badge>
                    : <span className="text-muted-foreground">—</span>
            ),
        },
        {
            accessorKey: "subject",
            header: "Subject",
            cell: ({ row }) => <span className="text-muted-foreground">{row.original.subject || "—"}</span>,
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
                { label: "Lessons" },
            ]}
        >
            <DataTable
                columns={columns}
                data={lessons}
                title="Lessons"
                searchKey={locale === 'ar' ? 'nameAr' : 'nameEn'}
                searchPlaceholder="Search lessons..."
                filters={[
                    {
                        key: "subject",
                        label: "Subject",
                        options: [
                            ...(subjects ?? []).map((s) => ({ value: locale === 'ar' ? s.nameAr : s.nameEn, label: locale === 'ar' ? s.nameAr : s.nameEn })),
                        ],
                    },
                    {
                        key: "unit",
                        label: "Unit",
                        options: [
                            ...(units ?? []).map((u) => ({ value: locale === 'ar' ? u.nameAr : u.nameEn, label: locale === 'ar' ? u.nameAr : u.nameEn })),
                        ],
                    },
                ]}
                onAdd={() => router.push("/lessons/new")}
                addButtonLabel="Add Lesson"
            />
        </AdminLayout>
    )
}
