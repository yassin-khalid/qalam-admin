"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconSearch, IconDots, IconEye, IconBan, IconRefresh } from "@tabler/icons-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocale } from "@/lib/locale-context"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useLiveQuery } from "@tanstack/react-db"
import { PendingTeacher, teacherColllection } from "@/collections/teachers"
import { useMutation } from "@tanstack/react-query"
import { ApiResponse } from "@/types/ApiResponse"
import { queryClient } from "@/lib/utils"
import { TEACHER_STATUS, locationLabelKey } from "@/lib/teacher-status"

export default function TeachersPage() {
    const { t, locale, direction } = useLocale()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [blockDialogOpen, setBlockDialogOpen] = React.useState(false)
    const [selectedTeacher, setSelectedTeacher] = React.useState<PendingTeacher | null>(null)
    const [blockReason, setBlockReason] = React.useState("")

    const { data: teachers } = useLiveQuery(q => q.from({ teachers: teacherColllection }))

    // TeacherStatus: 1 AwaitingDocuments, 2 PendingVerification, 3 DocumentsRejected, 4 Active, 5 Blocked
    const filteredTeachers = React.useMemo(() => {
        const query = searchQuery.trim().toLowerCase()
        return (teachers ?? []).filter((teacher) => {
            const matchesSearch =
                !query ||
                teacher.fullName?.toLowerCase().includes(query) ||
                teacher.email?.toLowerCase().includes(query) ||
                teacher.phoneNumber?.includes(searchQuery.trim())
            const matchesStatus = statusFilter === "all" || teacher.status === Number(statusFilter)
            return matchesSearch && matchesStatus
        })
    }, [teachers, searchQuery, statusFilter])

    const { mutate: blockTeacher } = useMutation({
        mutationFn: async ({ teacherId, reason }: { teacherId: number, reason?: string }) => {
            const access_token = localStorage.getItem('access_token');
            const trimmedReason = reason?.trim();
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherManagement/${teacherId}/Block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                    'Accept': 'application/json',
                    'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
                },
                // reason is optional (max 500); omit when empty.
                body: JSON.stringify({ reason: trimmedReason || undefined }),
            });
            const data = await response.json() as ApiResponse<null>
            if (!data.succeeded) {
                throw new Error(data.message);
            }
            return data.message;
        },
        onMutate: async ({ teacherId }) => {
            await queryClient.cancelQueries({ queryKey: ['teachers'] })
            const previousData = queryClient.getQueryData<PendingTeacher[]>(['teachers'])
            if (previousData) {
                queryClient.setQueryData<PendingTeacher[]>(['teachers'], (old) => {
                    if (!old) return [];
                    return old.map((teacher) => {
                        if (teacher.teacherId === teacherId) {
                            return { ...teacher, status: TEACHER_STATUS.Blocked }
                        }
                        return teacher;
                    });
                });
            }

        },
        onSuccess: (message) => {
            console.log("Teacher blocked:", message)
            queryClient.invalidateQueries({ queryKey: ['teachers'] })
        },
        onError: (error) => {
            console.error("Error blocking teacher:", error)
        },
    })


    const getStatusBadge = (status: number) => {
        switch (status) {
            case TEACHER_STATUS.AwaitingDocuments:
                return (
                    <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                        {t("teachers.awaiting")}
                    </Badge>
                )
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
            case TEACHER_STATUS.Active:
                return (
                    <Badge variant="outline" className="border-success text-success bg-success/10">
                        {t("teachers.active")}
                    </Badge>
                )
            case TEACHER_STATUS.Blocked:
                return (
                    <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">
                        {t("teachers.blocked")}
                    </Badge>
                )
            default:
                return null
        }
    }

    const handleBlockTeacher = (teacher: PendingTeacher) => {
        setSelectedTeacher(teacher)
        setBlockDialogOpen(true)
    }

    const confirmBlockTeacher = () => {
        // // In a real app, this would call the API: POST /api/teachers/{teacherId}/block
        // console.log("[v0] Blocking teacher:", selectedTeacher?.teacherId)
        if (!selectedTeacher) return;
        blockTeacher({ teacherId: selectedTeacher?.teacherId, reason: blockReason })
        setBlockDialogOpen(false)
        setSelectedTeacher(null)
        setBlockReason("")
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">{t("teachers.title")}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{t("teachers.subtitle")}</p>
                    </div>
                    <Button variant="outline" size="sm">
                        <IconRefresh className="h-4 w-4 me-2" />
                        {t("common.filter")}
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t("common.all")}</CardDescription>
                            <CardTitle className="text-2xl">{teachers?.length ?? 0}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t("teachers.pending")}</CardDescription>
                            <CardTitle className="text-2xl text-warning">
                                {teachers?.filter((teacher) => teacher.status === TEACHER_STATUS.PendingVerification).length ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t("teachers.active")}</CardDescription>
                            <CardTitle className="text-2xl text-success">
                                {teachers?.filter((teacher) => teacher.status === TEACHER_STATUS.Active).length ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t("teachers.blocked")}</CardDescription>
                            <CardTitle className="text-2xl text-destructive">
                                {teachers?.filter((teacher) => teacher.status === TEACHER_STATUS.Blocked).length ?? 0}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="relative flex-1">
                                <IconSearch className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${direction === "rtl" ? "right-3" : "left-3"}`} />
                                <Input
                                    placeholder={t("common.search")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={direction === "rtl" ? "pr-9" : "pl-9"}
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder={t("common.status")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("common.all")}</SelectItem>
                                    <SelectItem value={String(TEACHER_STATUS.AwaitingDocuments)}>{t("teachers.awaiting")}</SelectItem>
                                    <SelectItem value={String(TEACHER_STATUS.PendingVerification)}>{t("teachers.pending")}</SelectItem>
                                    <SelectItem value={String(TEACHER_STATUS.DocumentsRejected)}>{t("teachers.rejected")}</SelectItem>
                                    <SelectItem value={String(TEACHER_STATUS.Active)}>{t("teachers.active")}</SelectItem>
                                    <SelectItem value={String(TEACHER_STATUS.Blocked)}>{t("teachers.blocked")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Teachers Table */}
                <Card>
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
                                    <TableHead>{t("common.createdAt")}</TableHead>
                                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            {t("common.noData")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTeachers.map((teacher) => (
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
                                                    {teacher.approvedDocuments > 0 && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-success/10 text-success">
                                                            {teacher.approvedDocuments} {t("teachers.approvedDocuments")}
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
                                            <TableCell className="text-muted-foreground">
                                                {new Date(teacher.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                                            </TableCell>
                                            <TableCell className="text-end">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-1.5 py-1 text-sm font-medium transition-all hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 h-8 w-8 p-0">
                                                        <IconDots className="h-4 w-4" />
                                                        <span className="sr-only">{t("common.actions")}</span>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align={direction === "rtl" ? "start" : "end"}>
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/teachers/${teacher.teacherId}`)}
                                                            className="flex items-center gap-2 cursor-pointer"
                                                        >
                                                            <IconEye className="h-4 w-4" />
                                                            {t("teachers.viewDetails")}
                                                        </DropdownMenuItem>
                                                        {teacher.status !== TEACHER_STATUS.Blocked && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleBlockTeacher(teacher)}
                                                                >
                                                                    <IconBan className="h-4 w-4 me-2" />
                                                                    {t("teachers.blockTeacher")}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Block Teacher Dialog */}
            <AlertDialog
                open={blockDialogOpen}
                onOpenChange={(open) => {
                    setBlockDialogOpen(open)
                    if (!open) setBlockReason("")
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("teachers.blockTeacher")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("teachers.confirmBlock")}
                            {selectedTeacher && (
                                <span className="block mt-2 font-medium text-foreground">
                                    {selectedTeacher.fullName} ({selectedTeacher.email})
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="blockReason">{t("teachers.blockReason")}</Label>
                        <Textarea
                            id="blockReason"
                            placeholder={t("teachers.blockReasonPlaceholder")}
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-end">{blockReason.length}/500</p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmBlockTeacher}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t("teachers.blockTeacher")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    )
}
