"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    IconGlobe,
    // IconBookOpen,
    IconBook,
    IconFolderOpen,
    IconFileText,
    IconArrowRight,
    IconArrowLeft,
} from "@tabler/icons-react"
import { useLocale } from "@/lib/locale-context"

export function QuickActions() {
    const { t, direction } = useLocale()

    const quickActions = [
        {
            titleKey: "domains.addNew",
            descriptionKey: "domains.subtitle",
            icon: IconGlobe,
            href: "/domains/new",
            color: "text-chart-1",
        },
        {
            titleKey: "curriculums.addNew",
            descriptionKey: "curriculums.subtitle",
            icon: IconBook,
            href: "/curriculums/new",
            color: "text-chart-2",
        },
        {
            titleKey: "subjects.addNew",
            descriptionKey: "subjects.subtitle",
            icon: IconFolderOpen,
            href: "/subjects/new",
            color: "text-chart-3",
        },
        {
            titleKey: "lessons.addNew",
            descriptionKey: "lessons.subtitle",
            icon: IconFileText,
            href: "/lessons/new",
            color: "text-chart-4",
        },
    ]

    const ArrowIcon = direction === "rtl" ? IconArrowLeft : IconArrowRight

    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle className="text-foreground">{t("dashboard.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {quickActions.map((action) => (
                    <Link key={action.href} href={action.href}>
                        <Button
                            variant="ghost"
                            className="w-full justify-between h-auto py-3 px-4 hover:bg-secondary group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary group-hover:bg-background">
                                    <action.icon className={`h-4 w-4 ${action.color}`} />
                                </div>
                                <div className="text-start">
                                    <p className="text-sm font-medium text-foreground">{t(action.titleKey)}</p>
                                </div>
                            </div>
                            <ArrowIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </Button>
                    </Link>
                ))}
            </CardContent>
        </Card>
    )
}
