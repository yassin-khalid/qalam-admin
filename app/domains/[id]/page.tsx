
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    IconArrowLeft,
    IconPencil,
    IconTrash,
    IconBook,
    IconCalendar,
    IconHash,
    IconChevronRight,
} from "@tabler/icons-react"
import { DeleteDialog } from "@/components/admin/delete-dialog"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { domainCollection } from "@/collections/domain"
import { curriculumCollection } from "@/collections/curriculums"
import { useLocale } from "@/lib/locale-context"

// Mock data
const mockDomain = {
    id: "1",
    name: "Science & Technology",
    nameAr: "العلوم والتكنولوجيا",
    description: "All science and technology related subjects including physics, chemistry, biology, computer science, and engineering.",
    descriptionAr: "جميع المواضيع المتعلقة بالعلوم والتكنولوجيا بما في ذلك الفيزياء والكيمياء والأحياء وعلوم الكمبيوتر والهندسة.",
    active: true,
    order: 1,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    curriculums: [
        { id: "1", name: "National Curriculum 2024", nameAr: "المنهج الوطني 2024", active: true },
        { id: "2", name: "International Baccalaureate", nameAr: "البكالوريا الدولية", active: true },
        { id: "3", name: "Advanced Placement", nameAr: "التنسيب المتقدم", active: false },
    ],
}

export default function DomainDetailPage() {
    const router = useRouter()
    const { id } = useParams<{ id: string }>()
    const [deleteOpen, setDeleteOpen] = React.useState(false)
    const { locale } = useLocale()

    const handleDelete = async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        router.push("/domains")
    }

    const { data: domain } = useLiveQuery(q => q.from({ domains: domainCollection }).where(({ domains }) => eq(domains.id, parseInt(id))).findOne())
    const { data: curriculums } = useLiveQuery(q => q.from({ curriculums: curriculumCollection }).where(({ curriculums }) => eq(curriculums.domainId, parseInt(id))))

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Education Domains", href: "/domains" },
                { label: locale === "ar" ? domain?.nameAr ?? '' : domain?.nameEn ?? '' },
            ]}
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/domains")}
                            className="h-9 w-9"
                        >
                            <IconArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-foreground">{locale === "ar" ? domain?.nameAr ?? '' : domain?.nameEn ?? ''}</h1>
                                <Badge
                                    variant="outline"
                                    className={
                                        // domain is always active so we don't need to check if it is active
                                        true
                                            ? "bg-success/10 text-success border-success/20"
                                            : "bg-muted text-muted-foreground"
                                    }
                                >
                                    Active
                                </Badge>
                            </div>
                            <p className="text-muted-foreground" dir="rtl">{locale === "ar" ? domain?.nameEn ?? '' : domain?.nameAr ?? ''}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/domains/${id}/edit`)}
                            className="bg-transparent border-border"
                        >
                            <IconPencil className="mr-2 h-4 w-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteOpen(true)}
                            className="bg-transparent border-destructive text-destructive hover:bg-destructive/10"
                        >
                            <IconTrash className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Description</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">English</p>
                                    <p className="text-foreground">{domain?.descriptionEn || "-"}</p>
                                </div>
                                <Separator className="bg-border" />
                                <div dir="rtl">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">العربية</p>
                                    <p className="text-foreground">{domain?.descriptionAr || "-"}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Curriculums List */}
                        <Card className="bg-card border-border">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-foreground">Curriculums</CardTitle>
                                    <CardDescription>
                                        {curriculums?.length || 0} curriculum(s) in this domain
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={() => router.push("/curriculums/new")}
                                    className="bg-primary text-primary-foreground"
                                >
                                    Add Curriculum
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {curriculums?.map((curriculum) => (
                                        <Link
                                            key={curriculum.id}
                                            href={`/curriculums/${curriculum.id}`}
                                            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                                                    <IconBook className="h-5 w-5 text-chart-2" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{curriculum.nameEn || "-"}</p>
                                                    <p className="text-sm text-muted-foreground" dir="rtl">
                                                        {curriculum.nameAr || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        curriculum.isActive
                                                            ? "bg-success/10 text-success border-success/20"
                                                            : "bg-muted text-muted-foreground"
                                                    }
                                                >
                                                    {curriculum.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                                <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <Card className="bg-card border-border">
                            <CardHeader>
                                <CardTitle className="text-foreground">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                                        <IconHash className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Display Order</p>
                                        <p className="font-medium text-foreground">{domain?.id || "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                                        <IconBook className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Curriculums</p>
                                        <p className="font-medium text-foreground">{curriculums?.length || 0}</p>
                                    </div>
                                </div>
                                <Separator className="bg-border" />
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Created</p>
                                        <p className="font-medium text-foreground">{domain?.createdAt || "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Last Updated</p>
                                        <p className="font-medium text-foreground">{domain?.createdAt || "-"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <DeleteDialog
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Domain"
                itemName={mockDomain.name}
                description="Deleting this domain will also remove all associated curriculums, levels, grades, subjects, units, and lessons. This action cannot be undone."
                onConfirm={handleDelete}
            />
        </AdminLayout>
    )
}
