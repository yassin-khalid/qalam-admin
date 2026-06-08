"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { IconLock } from "@tabler/icons-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable, StatusCell, ActionsCell, SortableHeader } from "@/components/admin/data-table"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { RequirementFormDialog } from "@/components/admin/requirement-form-dialog"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale-context"
import { useLiveQuery } from "@tanstack/react-db"
import {
    teacherRequirementsCollection,
    toggleRequirementActive,
    TeacherRegistrationRequirement,
} from "@/collections/teacher-requirements"

export default function TeacherRequirementsPage() {
    const { t, locale } = useLocale()

    const [formDialog, setFormDialog] = React.useState<{
        open: boolean
        requirement: TeacherRegistrationRequirement | null
    }>({ open: false, requirement: null })

    const [deleteDialog, setDeleteDialog] = React.useState<{
        open: boolean
        requirement: TeacherRegistrationRequirement | null
    }>({ open: false, requirement: null })

    const { data: requirements } = useLiveQuery((q) =>
        q
            .from({ req: teacherRequirementsCollection })
            .orderBy(({ req }) => req.sortOrder)
    )

    const typeLabel = (type: TeacherRegistrationRequirement["requirementType"]) => {
        switch (type) {
            case "File":
                return t("treq.typeFile")
            case "Text":
                return t("treq.typeText")
            case "Boolean":
                return t("treq.typeBoolean")
            case "Selection":
                return t("treq.typeSelection")
            default:
                return type
        }
    }

    const columns: ColumnDef<TeacherRegistrationRequirement>[] = [
        {
            accessorKey: "sortOrder",
            header: ({ column }) => <SortableHeader column={column} title={t("common.order")} />,
            cell: ({ row }) => (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-sm font-medium text-foreground">
                    {row.original.sortOrder}
                </div>
            ),
        },
        {
            accessorKey: "code",
            header: ({ column }) => <SortableHeader column={column} title={t("treq.code")} />,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span dir="ltr" className="font-mono text-xs text-foreground">
                        {row.original.code}
                    </span>
                    {row.original.isSystem && (
                        <IconLock className="h-3.5 w-3.5 text-muted-foreground" aria-label={t("treq.system")} />
                    )}
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: t("common.name"),
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-foreground">
                        {locale === "ar" ? row.original.nameAr : row.original.nameEn}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {locale === "ar" ? row.original.descriptionAr : row.original.descriptionEn}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: "requirementType",
            header: t("treq.type"),
            cell: ({ row }) => <Badge variant="secondary">{typeLabel(row.original.requirementType)}</Badge>,
        },
        {
            accessorKey: "isRequired",
            header: t("treq.required"),
            cell: ({ row }) =>
                row.original.isRequired ? (
                    <Badge variant="outline" className="border-primary text-primary bg-primary/10">
                        {t("treq.required")}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            accessorKey: "isActive",
            header: t("common.status"),
            cell: ({ row }) => <StatusCell active={row.original.isActive} />,
            filterFn: (row, _id, value) => {
                if (value === "active") return row.original.isActive
                if (value === "inactive") return !row.original.isActive
                return true
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <ActionsCell
                    onEdit={() => setFormDialog({ open: true, requirement: row.original })}
                    onToggleStatus={() => handleToggle(row.original)}
                    isActive={row.original.isActive}
                    // System rows cannot be deleted — hide the action entirely.
                    onDelete={
                        row.original.isSystem
                            ? undefined
                            : () => setDeleteDialog({ open: true, requirement: row.original })
                    }
                />
            ),
        },
    ]

    const handleToggle = async (requirement: TeacherRegistrationRequirement) => {
        try {
            await toggleRequirementActive(requirement.id, !requirement.isActive)
        } catch (error) {
            console.error("Failed to toggle requirement:", error)
        }
    }

    const handleSubmit = async (value: Omit<TeacherRegistrationRequirement, "id" | "isSystem" | "createdAt">) => {
        if (formDialog.requirement) {
            const id = formDialog.requirement.id
            const transaction = teacherRequirementsCollection.update(id, (draft) => {
                draft.nameEn = value.nameEn
                draft.nameAr = value.nameAr
                draft.descriptionEn = value.descriptionEn
                draft.descriptionAr = value.descriptionAr
                draft.isActive = value.isActive
                draft.isRequired = value.isRequired
                draft.sortOrder = value.sortOrder
                draft.minCount = value.minCount
                draft.maxCount = value.maxCount
                draft.maxFileSizeBytes = value.maxFileSizeBytes
                draft.allowedExtensions = value.allowedExtensions
                draft.maxLength = value.maxLength
                draft.mapsToDocumentType = value.mapsToDocumentType
                draft.options = value.options
            })
            const result = await transaction.isPersisted.promise
            if (result.state === "failed") {
                throw new Error(result.error?.message ?? "Failed to update requirement")
            }
        } else {
            const transaction = teacherRequirementsCollection.insert({
                ...value,
                id: 0,
                isSystem: false,
                createdAt: null,
            })
            const result = await transaction.isPersisted.promise
            if (result.state === "failed") {
                throw new Error(result.error?.message ?? "Failed to create requirement")
            }
        }
    }

    const handleDelete = async () => {
        if (!deleteDialog.requirement) return
        const transaction = teacherRequirementsCollection.delete(deleteDialog.requirement.id)
        const result = await transaction.isPersisted.promise
        if (result.state === "completed") {
            setDeleteDialog({ open: false, requirement: null })
        } else if (result.state === "failed") {
            console.error(result.error?.message)
            throw new Error(result.error?.message ?? "Failed to delete requirement")
        }
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: t("nav.dashboard"), href: "/" },
                { label: t("treq.title") },
            ]}
        >
            <DataTable
                columns={columns}
                data={requirements ?? []}
                title={t("treq.title")}
                searchKey="code"
                searchPlaceholder={t("common.search")}
                filters={[
                    {
                        key: "isActive",
                        label: t("common.status"),
                        options: [
                            { value: "active", label: t("common.active") },
                            { value: "inactive", label: t("common.inactive") },
                        ],
                    },
                ]}
                onAdd={() => setFormDialog({ open: true, requirement: null })}
                addButtonLabel={t("treq.addNew")}
                emptyMessage={t("common.noData")}
            />

            <RequirementFormDialog
                open={formDialog.open}
                onOpenChange={(open) =>
                    setFormDialog((prev) => ({ open, requirement: open ? prev.requirement : null }))
                }
                requirement={formDialog.requirement}
                onSubmit={handleSubmit}
            />

            <DeleteDialog
                open={deleteDialog.open}
                onOpenChange={(open) =>
                    setDeleteDialog((prev) => ({ open, requirement: open ? prev.requirement : null }))
                }
                title={t("treq.deleteTitle")}
                itemName={
                    locale === "ar" ? deleteDialog.requirement?.nameAr : deleteDialog.requirement?.nameEn
                }
                description={t("treq.deleteConfirm")}
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
