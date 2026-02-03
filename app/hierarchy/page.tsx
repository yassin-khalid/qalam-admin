"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { HierarchyManager } from "@/components/admin/hierarchy-manager"
import { useLocale } from "@/lib/locale-context"

export default function HierarchyPage() {
    const { t } = useLocale()

    return (
        <AdminLayout
            breadcrumbs={[
                { label: t("nav.hierarchyManager") }
            ]}
        >
            <HierarchyManager />
        </AdminLayout>
    )
}
