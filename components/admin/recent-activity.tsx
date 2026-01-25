
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { IconPlus, IconPencil, IconTrash, IconToggleRight } from "@tabler/icons-react"
import { useLocale } from "@/lib/locale-context"

const activities = [
    {
        id: 1,
        action: "created",
        entity: "Lesson",
        name: "Introduction to Algebra",
        nameAr: "مقدمة في الجبر",
        user: "Ahmed Hassan",
        userAr: "أحمد حسن",
        time: "2 minutes ago",
        timeAr: "منذ دقيقتين",
        icon: IconPlus,
    },
    {
        id: 2,
        action: "updated",
        entity: "Subject",
        name: "Mathematics",
        nameAr: "الرياضيات",
        user: "Sarah Mohamed",
        userAr: "سارة محمد",
        time: "15 minutes ago",
        timeAr: "منذ 15 دقيقة",
        icon: IconPencil,
    },
    {
        id: 3,
        action: "activated",
        entity: "Unit",
        name: "Linear Equations",
        nameAr: "المعادلات الخطية",
        user: "Ahmed Hassan",
        userAr: "أحمد حسن",
        time: "1 hour ago",
        timeAr: "منذ ساعة",
        icon: IconToggleRight,
    },
    {
        id: 4,
        action: "deleted",
        entity: "Lesson",
        name: "Draft Lesson 1",
        nameAr: "درس مسودة 1",
        user: "Admin",
        userAr: "المدير",
        time: "2 hours ago",
        timeAr: "منذ ساعتين",
        icon: IconTrash,
    },
    {
        id: 5,
        action: "created",
        entity: "Grade",
        name: "Grade 10",
        nameAr: "الصف العاشر",
        user: "Sarah Mohamed",
        userAr: "سارة محمد",
        time: "3 hours ago",
        timeAr: "منذ 3 ساعات",
        icon: IconPlus,
    },
    {
        id: 6,
        action: "updated",
        entity: "Curriculum",
        name: "National Curriculum 2025",
        nameAr: "المنهج الوطني 2025",
        user: "Admin",
        userAr: "المدير",
        time: "4 hours ago",
        timeAr: "منذ 4 ساعات",
        icon: IconPencil,
    },
    {
        id: 7,
        action: "created",
        entity: "Domain",
        name: "STEM Education",
        nameAr: "تعليم العلوم والتكنولوجيا",
        user: "Ahmed Hassan",
        userAr: "أحمد حسن",
        time: "5 hours ago",
        timeAr: "منذ 5 ساعات",
        icon: IconPlus,
    },
    {
        id: 8,
        action: "deactivated",
        entity: "Level",
        name: "Advanced Level",
        nameAr: "المستوى المتقدم",
        user: "Sarah Mohamed",
        userAr: "سارة محمد",
        time: "6 hours ago",
        timeAr: "منذ 6 ساعات",
        icon: IconToggleRight,
    },
]

const actionColors: Record<string, string> = {
    created: "bg-success/10 text-success border-success/20",
    updated: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    deleted: "bg-destructive/10 text-destructive border-destructive/20",
    activated: "bg-success/10 text-success border-success/20",
    deactivated: "bg-warning/10 text-warning border-warning/20",
}

const actionTranslations: Record<string, { en: string; ar: string }> = {
    created: { en: "created", ar: "أنشأ" },
    updated: { en: "updated", ar: "حدّث" },
    deleted: { en: "deleted", ar: "حذف" },
    activated: { en: "activated", ar: "فعّل" },
    deactivated: { en: "deactivated", ar: "أوقف" },
}

export function RecentActivity() {
    const { t, locale } = useLocale()

    return (
        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle className="text-foreground">{t("dashboard.recentActivity")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                    <div className="space-y-1 px-6 pb-6">
                        {activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-secondary"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                                    <activity.icon className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">
                                        <span className="font-medium">{locale === "ar" ? activity.userAr : activity.user}</span>{" "}
                                        <Badge variant="outline" className={`mx-1 ${actionColors[activity.action]}`}>
                                            {actionTranslations[activity.action][locale]}
                                        </Badge>{" "}
                                        <span className="font-medium">{locale === "ar" ? activity.nameAr : activity.name}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {locale === "ar" ? activity.timeAr : activity.time}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
