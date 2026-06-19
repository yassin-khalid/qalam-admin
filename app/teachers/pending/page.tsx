"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconEye, IconUsers } from "@tabler/icons-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useLocale } from "@/lib/locale-context"
import { useLiveQuery } from "@tanstack/react-db"
import { pendingTeacherCollection } from "@/collections/teachers"
import { cn } from "@/lib/utils"
import { TEACHER_STATUS, locationLabelKey } from "@/lib/teacher-status"

export default function PendingTeachersPage() {
    const { t, direction } = useLocale()
    const router = useRouter()

    const { data: teachers } = useLiveQuery(q => q.from({ teachers: pendingTeacherCollection }))

    // Endpoint #2 already scopes to PendingVerification + DocumentsRejected.
    const getStatusBadge = (status: number) => {
        switch (status) {
            case TEACHER_STATUS.PendingVerification:
                return (
                    <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                        {t("teachers.pending")}
                    </Badge>
                )
            case TEACHER_STATUS.DocumentsRejected:
                return (
                    <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">
                        {t("teachers.rejected")}
                    </Badge>
                )
            default:
                return null
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">{t("teachers.pendingQueueTitle")}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{t("teachers.pendingQueueSubtitle")}</p>
                    </div>
                    <Link href="/teachers" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                        <IconUsers className="h-4 w-4 me-2" />
                        {t("teachers.allTeachers")}
                    </Link>
                </div>

                {/* Queue Table */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">
                            {teachers?.length ?? 0} {t("teachers.pendingQueueTitle")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("teachers.fullName")}</TableHead>
                                    <TableHead>{t("teachers.email")}</TableHead>
                                    <TableHead>{t("teachers.phoneNumber")}</TableHead>
                                    <TableHead>{t("teachers.location")}</TableHead>
                                    <TableHead className="text-center">{t("teachers.documentSummary")}</TableHead>
                                    <TableHead>{t("common.status")}</TableHead>
                                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(teachers?.length ?? 0) === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            {t("teachers.noPendingTeachers")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    teachers?.map((teacher) => (
                                        <TableRow key={teacher.teacherId}>
                                            <TableCell className="font-medium">{teacher.fullName}</TableCell>
                                            <TableCell>{teacher.email}</TableCell>
                                            <TableCell dir="ltr" className={direction === "rtl" ? "text-right" : ""}>{teacher.phoneNumber}</TableCell>
                                            <TableCell>
                                                {(() => {
                                                    const key = locationLabelKey(teacher.location)
                                                    return key ? t(key) : (teacher.location ?? "—")
                                                })()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-2 text-xs">
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted">
                                                        {teacher.totalDocuments} {t("teachers.totalDocuments")}
                                                    </span>
                                                    {teacher.pendingDocuments > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-warning/10 text-warning">
                                                            {teacher.pendingDocuments} {t("teachers.pendingDocuments")}
                                                        </span>
                                                    )}
                                                    {teacher.rejectedDocuments > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-destructive/10 text-destructive">
                                                            {teacher.rejectedDocuments} {t("teachers.rejectedDocuments")}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                                            <TableCell className="text-end">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/teachers/${teacher.teacherId}`)}
                                                >
                                                    <IconEye className="h-4 w-4 me-2" />
                                                    {t("teachers.review")}
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
