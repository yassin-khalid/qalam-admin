"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    IconLayoutDashboard,
    IconGlobe,
    IconBook,
    IconSchool,
    IconFolder,
    IconFile,
    IconBook2,
    IconSettings,
    IconLogout,
    IconUser,
    IconLayersLinked,
} from "@tabler/icons-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLocale } from "@/lib/locale-context"

const navigationItems = [
    {
        titleKey: "nav.dashboard",
        icon: IconLayoutDashboard,
        href: "/",
    },
    {
        titleKey: "nav.domains",
        icon: IconGlobe,
        href: "/domains",
    },
    {
        titleKey: "nav.curriculums",
        icon: IconBook,
        href: "/curriculums",
    },
    {
        titleKey: "nav.levels",
        icon: IconSchool,
        href: "/levels",
    },
    {
        titleKey: "nav.grades",
        icon: IconLayersLinked,
        href: "/grades",
    },
    {
        titleKey: "nav.subjects",
        icon: IconFolder,
        href: "/subjects",
    },
    {
        titleKey: "nav.units",
        icon: IconBook2,
        href: "/units",
    },
    {
        titleKey: "nav.lessons",
        icon: IconFile,
        href: "/lessons",
    },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const { t, direction } = useLocale()

    return (
        <Sidebar className="border-e border-sidebar-border" side={direction === "rtl" ? "right" : "left"}>
            <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
                <Link href="/" className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <IconSchool className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground">EduAdmin</span>
                        <span className="text-xs text-muted-foreground">Management System</span>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent className="px-2 py-4">
                <SidebarGroup>
                    <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t("nav.navigation")}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navigationItems.map((item) => (
                                <SidebarMenuItem key={item.href}>
                                    <SidebarMenuButton
                                        render={(props) => <Link {...props} href={item.href} />}
                                        isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
                                        className="group"
                                    >
                                        <item.icon className="h-4 w-4" />
                                        <span>{t(item.titleKey)}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup className="mt-auto">
                    <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {t("nav.system")}
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    render={(props) => <Link {...props} href="/settings" />}
                                    isActive={pathname === "/settings"}
                                >
                                    <IconSettings className="h-4 w-4" />
                                    <span>{t("nav.settings")}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-3">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent focus:outline-none">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                AD
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <p className="truncate text-sm font-medium text-foreground">{t("user.adminUser")}</p>
                            <p className="truncate text-xs text-muted-foreground">admin@eduadmin.com</p>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuItem>
                            <IconUser className="me-2 h-4 w-4" />
                            {t("user.profile")}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <IconSettings className="me-2 h-4 w-4" />
                            {t("nav.settings")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <IconLogout className="me-2 h-4 w-4" />
                            {t("user.logout")}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
