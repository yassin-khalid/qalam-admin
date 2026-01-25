
"use client"

import * as React from "react"
import { IconSearch, IconWorld, IconBell, IconMoon, IconSun, IconHeartRateMonitor } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLocale } from "@/lib/locale-context"
import { useTheme } from "next-themes"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface AdminHeaderProps {
    breadcrumbs?: { label: string; href?: string }[]
    title?: string
}

export function AdminHeader({ breadcrumbs = [] }: AdminHeaderProps) {
    const { locale, setLocale, t } = useLocale()
    const { theme, setTheme, resolvedTheme } = useTheme()

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

                <div className="flex flex-1 items-center gap-4">
                    {breadcrumbs.length > 0 && (
                        <Breadcrumb className="hidden md:flex">
                            <BreadcrumbList>
                                {breadcrumbs.map((item, index) => (
                                    <React.Fragment key={index}>
                                        <BreadcrumbItem>
                                            {item.href ? (
                                                <BreadcrumbLink
                                                    render={(props) => (
                                                        <Link {...props} href={item.href!} className="font-medium">
                                                            {item.label}
                                                        </Link>
                                                    )}
                                                />
                                            ) : (
                                                <BreadcrumbPage className="font-medium">
                                                    {item.label}
                                                </BreadcrumbPage>
                                            )}
                                        </BreadcrumbItem>
                                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                    </React.Fragment>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative hidden md:block">
                        <IconSearch className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={t("common.search")}
                            className="w-64 bg-secondary border-0 ps-9 text-sm placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                        />
                    </div>

                    {/* Theme Toggle */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-transparent h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-all">
                            {resolvedTheme === "dark" ? (
                                <IconMoon className="h-4 w-4" />
                            ) : (
                                <IconSun className="h-4 w-4" />
                            )}
                            <span className="sr-only">{t("settings.theme")}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setTheme("light")} className={cn(theme === "light" && "bg-accent text-accent-foreground")}>
                                <IconSun className="me-2 h-4 w-4" />
                                {t("settings.light")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")} className={cn(theme === "dark" && "bg-accent text-accent-foreground")}>
                                <IconMoon className="me-2 h-4 w-4" />
                                {t("settings.dark")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("system")} className={cn(theme === "system" && "bg-accent text-accent-foreground")}>
                                <IconHeartRateMonitor className="me-2 h-4 w-4" />
                                {t("settings.system")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Language Switcher */}
                    <DropdownMenu>
                        <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-transparent h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 transition-all">
                            <IconWorld className="h-4 w-4" />
                            <span className="sr-only">{t("settings.language")}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLocale("en")} className={cn(locale === "en" && "bg-accent text-accent-foreground")}>
                                English
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setLocale("ar")} className={cn(locale === "ar" && "bg-accent text-accent-foreground")}>
                                العربية
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" size="icon" className="relative h-9 w-9 text-muted-foreground hover:text-foreground">
                        <IconBell className="h-4 w-4" />
                        <span className="absolute end-2 top-2 h-2 w-2 rounded-full bg-primary" />
                        <span className="sr-only">{t("settings.notifications")}</span>
                    </Button>
                </div>
            </div>
        </header >
    )
}
