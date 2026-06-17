
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { useLocale } from "@/lib/locale-context"
import { useLiveQuery } from "@tanstack/react-db"
import { domainCollection, domainWithCurriculumsCount } from "@/collections/domain"
import { toast } from "sonner"

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
                        // Domains have no toggle-status endpoint; flip isActive via PUT update.
                        const tx = domainCollection.update(row.original.id, draft => {
                            draft.isActive = !row.original.active
                        })
                        tx.isPersisted.promise.then(result => {
                            if (result.state === "failed") {
                                toast.error(result.error?.message ?? "Failed to update domain")
                            }
                        })
                    }}
                    isActive={row.original.active}
                />
            ),
        },
    ]

    const handleDelete = async () => {
        if (deleteDialog.domain?.id) {
            // setDomains((prev) => prev.filter((d) => d.id !== deleteDialog.domain!.id))
            const transaction = domainCollection.delete(deleteDialog.domain.id)
            transaction.isPersisted.promise.then(result => {
                if (result.state === "completed") {
                    setDeleteDialog({ open: false, domain: null })
                }
                if (result.state === "failed") {
                    // e.g. 400 "Cannot delete domain with existing education levels"
                    toast.error(result.error?.message ?? "Failed to delete domain")
                }
            })
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
