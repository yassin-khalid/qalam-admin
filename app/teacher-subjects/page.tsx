"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconBook, IconExternalLink } from "@tabler/icons-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale-context"
import { useLiveQuery } from "@tanstack/react-db"
import { AdminTeacherSubject, teacherSubjectsCollection } from "@/collections/teacher-subjects"

export default function TeacherSubjectsPage() {
    const { t, locale, direction } = useLocale()
    const router = useRouter()
    const [statusFilter, setStatusFilter] = React.useState<string>("all")

    const { data: subjects } = useLiveQuery(q => q.from({ subjects: teacherSubjectsCollection }))

    const filtered = React.useMemo(() => {
        return (subjects ?? []).filter((s) => {
            switch (statusFilter) {
                case "pending": return s.verificationStatus === 1
                case "approved": return s.verificationStatus === 2
                case "rejected": return s.verificationStatus === 3
                case "active": return s.isActive && s.verificationStatus === 2
                case "inactive": return !s.isActive && s.verificationStatus === 2
                default: return true
            }
        })
    }, [subjects, statusFilter])

    const getSubjectName = (s: AdminTeacherSubject) =>
        (locale === "ar" ? s.subjectNameAr : s.subjectNameEn) || s.subjectNameEn || s.subjectNameAr

    // Rejected (3) wins, then Pending (1), then inactive, else active — matches the
    // detail page status-pill logic.
    const getStatusBadge = (s: AdminTeacherSubject) => {
        if (s.verificationStatus === 3) {
            return (
                <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">
                    {t("teachers.rejected")}
                </Badge>
            )
        }
        if (s.verificationStatus === 1) {
            return (
                <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                    {t("teachers.pending")}
                </Badge>
            )
        }
        if (!s.isActive) {
            return (
                <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground bg-muted">
                    {t("teachers.inactive")}
                </Badge>
            )
        }
        return (
            <Badge variant="outline" className="border-success text-success bg-success/10">
                {t("teachers.active")}
            </Badge>
        )
    }

    const scopeLabel = (s: AdminTeacherSubject) =>
        s.canTeachFullSubject ? t("teachers.fullSubject") : `${s.units.length} ${t("teachers.units")}`

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">{t("tsub.title")}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{t("tsub.subtitle")}</p>
                    </div>
                </div>

                {/* Filter */}
                <Card>
                    <CardContent className="pt-6">
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder={t("tsub.allStatuses")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("tsub.allStatuses")}</SelectItem>
                                <SelectItem value="pending">{t("tsub.statusPending")}</SelectItem>
                                <SelectItem value="approved">{t("tsub.statusApproved")}</SelectItem>
                                <SelectItem value="rejected">{t("tsub.statusRejected")}</SelectItem>
                                <SelectItem value="active">{t("tsub.activeOnly")}</SelectItem>
                                <SelectItem value="inactive">{t("tsub.inactiveOnly")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("tsub.teacher")}</TableHead>
                                    <TableHead>{t("tsub.subject")}</TableHead>
                                    <TableHead>{t("tsub.scope")}</TableHead>
                                    <TableHead>{t("common.status")}</TableHead>
                                    <TableHead>{t("common.createdAt")}</TableHead>
                                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <IconBook className="h-8 w-8 text-muted-foreground" />
                                                {t("tsub.noSubjects")}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium">{s.teacherFullName}</TableCell>
                                            <TableCell>{getSubjectName(s)}</TableCell>
                                            <TableCell className="text-muted-foreground">{scopeLabel(s)}</TableCell>
                                            <TableCell>{getStatusBadge(s)}</TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {new Date(s.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/teachers/${s.teacherId}`)}
                                                >
                                                    <IconExternalLink className={`h-4 w-4 ${direction === "rtl" ? "ms-2" : "me-2"}`} />
                                                    {t("tsub.viewTeacher")}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    )
}
