
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IconGlobe, IconBook, IconSchool, IconStack, IconFolderOpen, IconBookmark, IconFileText, IconTrendingUp } from "@tabler/icons-react"
import { useLocale } from "@/lib/locale-context"

export function DashboardStats() {
    const { t } = useLocale()

    const stats = [
        {
            titleKey: "nav.domains",
            value: "12",
            change: "+2",
            icon: IconGlobe,
            color: "text-chart-1",
            bgColor: "bg-chart-1/10",
        },
        {
            titleKey: "nav.curriculums",
            value: "48",
            change: "+5",
            icon: IconBook,
            color: "text-chart-2",
            bgColor: "bg-chart-2/10",
        },
        {
            titleKey: "nav.levels",
            value: "24",
            change: "+3",
            icon: IconSchool,
            color: "text-chart-3",
            bgColor: "bg-chart-3/10",
        },
        {
            titleKey: "nav.grades",
            value: "156",
            change: "+12",
            icon: IconStack,
            color: "text-chart-4",
            bgColor: "bg-chart-4/10",
        },
        {
            titleKey: "nav.subjects",
            value: "324",
            change: "+28",
            icon: IconFolderOpen,
            color: "text-chart-5",
            bgColor: "bg-chart-5/10",
        },
        {
            titleKey: "nav.units",
            value: "1,842",
            change: "+156",
            icon: IconBookmark,
            color: "text-chart-1",
            bgColor: "bg-chart-1/10",
        },
        {
            titleKey: "nav.lessons",
            value: "12,456",
            change: "+892",
            icon: IconFileText,
            color: "text-chart-2",
            bgColor: "bg-chart-2/10",
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {stats.map((stat) => (
                <Card key={stat.titleKey} className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {t(stat.titleKey)}
                        </CardTitle>
                        <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                        <div className="flex items-center gap-1 text-xs text-success">
                            <IconTrendingUp className="h-3 w-3" />
                            <span>{stat.change}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
