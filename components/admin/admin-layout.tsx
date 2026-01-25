"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"

interface BreadcrumbItem {
    label: string
    href?: string
}

interface AdminLayoutProps {
    children: React.ReactNode
    breadcrumbs?: BreadcrumbItem[]
    title?: string
}

export function AdminLayout({ children, breadcrumbs, title }: AdminLayoutProps) {
    return (
        <SidebarProvider defaultOpen={true}>
            <AdminSidebar />
            <SidebarInset className="flex flex-col">
                <AdminHeader breadcrumbs={breadcrumbs} title={title} />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
