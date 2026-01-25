
"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    IconChevronRight,
    IconChevronDown,
    IconChevronLeft,
    IconWorld,
    IconBook,
    IconSchool,
    IconStack,
    IconFolderOpen,
    IconBookmark,
    IconFileText
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale-context"

interface TreeNode {
    id: string
    name: string
    nameAr?: string
    type: "domain" | "curriculum" | "level" | "grade" | "subject" | "unit" | "lesson"
    active: boolean
    children?: TreeNode[]
}

const treeData: TreeNode[] = [
    {
        id: "1",
        name: "Science & Technology",
        nameAr: "العلوم والتكنولوجيا",
        type: "domain",
        active: true,
        children: [
            {
                id: "1-1",
                name: "National Curriculum",
                nameAr: "المنهج الوطني",
                type: "curriculum",
                active: true,
                children: [
                    {
                        id: "1-1-1",
                        name: "Secondary Education",
                        nameAr: "التعليم الثانوي",
                        type: "level",
                        active: true,
                        children: [
                            {
                                id: "1-1-1-1",
                                name: "Grade 10",
                                nameAr: "الصف العاشر",
                                type: "grade",
                                active: true,
                                children: [
                                    {
                                        id: "1-1-1-1-1",
                                        name: "Mathematics",
                                        nameAr: "الرياضيات",
                                        type: "subject",
                                        active: true,
                                        children: [
                                            {
                                                id: "1-1-1-1-1-1",
                                                name: "Algebra",
                                                nameAr: "الجبر",
                                                type: "unit",
                                                active: true,
                                                children: [
                                                    { id: "1-1-1-1-1-1-1", name: "Introduction to Variables", nameAr: "مقدمة للمتغيرات", type: "lesson", active: true },
                                                    { id: "1-1-1-1-1-1-2", name: "Linear Equations", nameAr: "المعادلات الخطية", type: "lesson", active: true },
                                                ]
                                            },
                                            {
                                                id: "1-1-1-1-1-2",
                                                name: "Geometry",
                                                nameAr: "الهندسة",
                                                type: "unit",
                                                active: true,
                                                children: [
                                                    { id: "1-1-1-1-1-2-1", name: "Triangles", nameAr: "المثلثات", type: "lesson", active: true },
                                                ]
                                            },
                                        ]
                                    },
                                    {
                                        id: "1-1-1-1-2",
                                        name: "Physics",
                                        nameAr: "الفيزياء",
                                        type: "subject",
                                        active: true,
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
        ]
    },
    {
        id: "2",
        name: "Humanities",
        nameAr: "العلوم الإنسانية",
        type: "domain",
        active: true,
        children: [
            {
                id: "2-1",
                name: "International Curriculum",
                nameAr: "المنهج الدولي",
                type: "curriculum",
                active: false,
            },
        ]
    },
]

const typeIcons: Record<string, React.ElementType> = {
    domain: IconWorld,
    curriculum: IconBook,
    level: IconSchool,
    grade: IconStack,
    subject: IconFolderOpen,
    unit: IconBookmark,
    lesson: IconFileText,
}

const typeColors: Record<string, string> = {
    domain: "text-chart-1",
    curriculum: "text-chart-2",
    level: "text-chart-3",
    grade: "text-chart-4",
    subject: "text-chart-5",
    unit: "text-chart-1",
    lesson: "text-chart-2",
}

function TreeItem({ node, level = 0 }: { node: TreeNode; level?: number }) {
    const [isOpen, setIsOpen] = React.useState(level < 2)
    const hasChildren = node.children && node.children.length > 0
    const Icon = typeIcons[node.type]
    const { locale, direction, t } = useLocale()

    const IconChevronClosed = direction === "rtl" ? IconChevronLeft : IconChevronRight

    return (
        <div>
            <button
                onClick={() => hasChildren && setIsOpen(!isOpen)}
                className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm transition-colors hover:bg-secondary",
                    hasChildren && "cursor-pointer"
                )}
                style={{ paddingInlineStart: `${level * 16 + 8}px` }}
            >
                {hasChildren ? (
                    isOpen ? (
                        <IconChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                        <IconChevronClosed className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )
                ) : (
                    <span className="w-4" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0", typeColors[node.type])} />
                <span className="truncate text-foreground">
                    {locale === "ar" && node.nameAr ? node.nameAr : node.name}
                </span>
                {!node.active && (
                    <Badge variant="outline" className="ms-auto shrink-0 text-xs bg-muted text-muted-foreground">
                        {t("common.inactive")}
                    </Badge>
                )}
            </button>
            {hasChildren && isOpen && (
                <div>
                    {node.children!.map((child) => (
                        <TreeItem key={child.id} node={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

export function HierarchyTree() {
    const { t } = useLocale()

    return (
        <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">{t("dashboard.contentHierarchy")}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                    {t("common.active")}
                </Badge>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[400px] px-4 pb-4">
                    {treeData.map((node) => (
                        <TreeItem key={node.id} node={node} />
                    ))}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
