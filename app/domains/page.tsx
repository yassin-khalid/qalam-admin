
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { useLocale } from "@/lib/locale-context"
import { count, eq, liveQueryCollectionOptions, useLiveQuery } from "@tanstack/react-db"
import { domainCollection, domainWithCurriculumsCount } from "@/collections/domain"
import { curriculumCollection } from "@/collections/curriculums"

interface Domain {
    id: number,
    name: string
    nameAr: string
    description?: string
    descriptionAr?: string
    active: boolean
    // order: number
    curriculumsCount: number
    createdAt: string
}

const mockDomains: Domain[] = [
    {
        id: 1,
        name: "Science & Technology",
        nameAr: "العلوم والتكنولوجيا",
        description: "All science and technology related subjects",
        descriptionAr: "جميع المواد المتعلقة بالعلوم والتكنولوجيا",
        active: true,
        // order: 1,
        curriculumsCount: 5,
        createdAt: "2024-01-15",
    },
    {
        id: 2,
        name: "Humanities",
        nameAr: "العلوم الإنسانية",
        description: "Arts, history, philosophy, and social sciences",
        descriptionAr: "الفنون والتاريخ والفلسفة والعلوم الاجتماعية",
        active: true,
        // order: 2,
        curriculumsCount: 3,
        createdAt: "2024-01-10",
    },
    {
        id: 3,
        name: "Languages",
        nameAr: "اللغات",
        description: "Arabic, English, and foreign languages",
        descriptionAr: "العربية والإنجليزية واللغات الأجنبية",
        active: true,
        // order: 3,
        curriculumsCount: 4,
        createdAt: "2024-01-08",
    },
    {
        id: 4,
        name: "Mathematics",
        nameAr: "الرياضيات",
        description: "Pure and applied mathematics",
        descriptionAr: "الرياضيات البحتة والتطبيقية",
        active: true,
        // order: 4,
        curriculumsCount: 2,
        createdAt: "2024-01-05",
    },
    {
        id: 5,
        name: "Physical Education",
        nameAr: "التربية البدنية",
        description: "Sports and physical activities",
        descriptionAr: "الرياضة والأنشطة البدنية",
        active: false,
        // order: 5,
        curriculumsCount: 1,
        createdAt: "2024-01-03",
    },
    {
        id: 6,
        name: "Arts & Design",
        nameAr: "الفنون والتصميم",
        description: "Visual arts, music, and creative design",
        descriptionAr: "الفنون البصرية والموسيقى والتصميم الإبداعي",
        active: true,
        // order: 6,
        curriculumsCount: 2,
        createdAt: "2024-01-01",
    },
]

export default function DomainsPage() {
    const router = useRouter()
    const { t, locale } = useLocale()
    // const [domains, setDomains] = React.useState(mockDomains)
    const [deleteDialog, setDeleteDialog] = React.useState<{ open: boolean; domain: Domain | null }>({
        open: false,
        domain: null,
    })

    // const { data: domains } = useLiveQuery(q => q.from({ domains: domainCollection })
    //     .join({ curriculums: curriculumCollection }, ({ curriculums, domains }) => eq(domains.id, curriculums.id), 'left')
    //     .orderBy(({ domains }) => domains.id)
    //     .where(({ curriculums }) => eq(curriculums?.isActive, true))
    //     .groupBy(({ domains }) => [
    //         domains.id,
    //         domains.nameEn,
    //         domains.nameAr,
    //         domains.descriptionEn,
    //         domains.descriptionAr,
    //         domains.createdAt,
    //         domains.id,
    //         true,

    //     ])
    //     .select(({ curriculums, domains }) => ({
    //         id: domains.id,
    //         name: domains.nameEn,
    //         nameAr: domains.nameAr,
    //         description: domains.descriptionAr,
    //         descriptionAr: domains.descriptionAr,
    //         createdAt: domains.createdAt,
    //         order: domains.id,
    //         active: true,
    //         curriculumsCount: count(curriculums?.id ?? 0),
    //     })))

    // console.log({ domains })
    const { data: domains } = useLiveQuery(domainWithCurriculumsCount)

    const columns: ColumnDef<Domain>[] = [
        {
            accessorKey: "order",
            header: ({ column }) => <SortableHeader column={column} title={t("common.order")} />,
            cell: ({ row }) => (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-sm font-medium text-foreground">
                    {row.original.id}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => <SortableHeader column={column} title={t("common.name")} />,
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-foreground">
                        {locale === "ar" ? row.original.nameAr : row.original.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {locale === "ar" ? row.original.descriptionAr : row.original.description}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "nameAr",
            header: locale === "ar" ? t("domains.nameEn") : t("domains.nameAr"),
            cell: ({ row }) => (
                <span dir={locale === "ar" ? "ltr" : "rtl"} className="text-foreground">
                    {locale === "ar" ? row.original.name : row.original.nameAr}
                </span>
            ),
        },
        {
            accessorKey: "curriculumsCount",
            header: ({ column }) => <SortableHeader column={column} title={t("nav.curriculums")} />,
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.curriculumsCount}</span>
            ),
        },
        {
            accessorKey: "active",
            header: t("common.status"),
            cell: ({ row }) => <StatusCell active={row.original.active} />,
            filterFn: (row, id, value) => {
                if (value === "active") return row.original.active
                if (value === "inactive") return !row.original.active
                return true
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <ActionsCell
                    onView={() => router.push(`/domains/${row.original.id}`)}
                    onEdit={() => router.push(`/domains/${row.original.id}/edit`)}
                    onDelete={() => setDeleteDialog({ open: true, domain: row.original })}
                    onToggleStatus={() => {
                        // setDomains((prev) =>
                        //     prev.map((d) =>
                        //         d.id === row.original.id ? { ...d, active: !d.active } : d
                        //     )
                        // )
                    }}
                    isActive={row.original.active}
                />
            ),
        },
    ]

    const handleDelete = async () => {
        if (deleteDialog.domain) {
            // setDomains((prev) => prev.filter((d) => d.id !== deleteDialog.domain!.id))
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: t("nav.dashboard"), href: "/" },
                { label: t("nav.domains") },
            ]}
        >
            <DataTable
                columns={columns}
                data={domains}
                title={t("domains.title")}
                searchKey="name"
                searchPlaceholder={t("common.search")}
                filters={[
                    {
                        key: "active",
                        label: t("common.status"),
                        options: [
                            { value: "active", label: t("common.active") },
                            { value: "inactive", label: t("common.inactive") },
                        ],
                    },
                ]}
                onAdd={() => router.push("/domains/new")}
                addButtonLabel={t("domains.addNew")}
                emptyMessage={t("common.noData")}
            />

            <DeleteDialog
                open={deleteDialog.open}
                onOpenChange={(open) => setDeleteDialog({ open, domain: open ? deleteDialog.domain : null })}
                title={t("domains.deleteDomain")}
                itemName={locale === "ar" ? deleteDialog.domain?.nameAr : deleteDialog.domain?.name}
                description={t("domains.deleteConfirm")}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
