"use client"

import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { RecentActivity } from "@/components/admin/recent-activity"
import { QuickActions } from "@/components/admin/quick-actions"
import { HierarchyTree } from "@/components/admin/hierarchy-tree"
import { useLocale } from "@/lib/locale-context"

export default function DashboardPage() {
  const { t } = useLocale()

  return (
    <AdminLayout
      breadcrumbs={[
        { label: t("nav.dashboard") }
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">
            {t("dashboard.welcome")}
          </p>
        </div>

        <DashboardStats />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
          <div className="space-y-6">
            <QuickActions />
          </div>
        </div>

        <HierarchyTree />
      </div>
    </AdminLayout>
  )
}
