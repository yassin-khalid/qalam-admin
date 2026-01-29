"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconSearch, IconDots, IconEye, IconBan, IconCheck, IconRefresh } from "@tabler/icons-react"
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

// Mock data for teachers
const mockTeachers = [
    {
        teacherId: 1,
        userId: 2,
        fullName: "Ahmed Al-Farsi",
        phoneNumber: "+966554709484",
        email: "ahmed.alfarsi@qalam.com",
        status: 1, // 1: Pending, 2: Active, 3: Blocked
        location: 1,
        createdAt: "2026-01-29T03:16:58.38936",
        totalDocuments: 2,
        pendingDocuments: 1,
        approvedDocuments: 1,
        rejectedDocuments: 0,
    },
    {
        teacherId: 2,
        userId: 3,
        fullName: "Sara Mohammed",
        phoneNumber: "+966501234567",
        email: "sara.mohammed@qalam.com",
        status: 2,
        location: 2,
        createdAt: "2026-01-28T10:30:00.000",
        totalDocuments: 3,
        pendingDocuments: 0,
        approvedDocuments: 3,
        rejectedDocuments: 0,
    },
    {
        teacherId: 3,
        userId: 4,
        fullName: "Khalid Hassan",
        phoneNumber: "+966509876543",
        email: "khalid.hassan@qalam.com",
        status: 3,
        location: 1,
        createdAt: "2026-01-27T15:45:00.000",
        totalDocuments: 2,
        pendingDocuments: 0,
        approvedDocuments: 1,
        rejectedDocuments: 1,
    },
    {
        teacherId: 4,
        userId: 5,
        fullName: "Fatima Al-Rashid",
        phoneNumber: "+966512345678",
        email: "fatima.alrashid@qalam.com",
        status: 1,
        location: 3,
        createdAt: "2026-01-26T09:00:00.000",
        totalDocuments: 2,
        pendingDocuments: 2,
        approvedDocuments: 0,
        rejectedDocuments: 0,
    },
]

const locationNames: Record<number, { en: string; ar: string }> = {
    1: { en: "Riyadh", ar: "الرياض" },
    2: { en: "Jeddah", ar: "جدة" },
    3: { en: "Dammam", ar: "الدمام" },
}

export default function TeachersPage() {
    const { t, locale, direction } = useLocale()
    const router = useRouter()
    const [searchQuery, setSearchQuery] = React.useState("")
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [blockDialogOpen, setBlockDialogOpen] = React.useState(false)
    const [selectedTeacher, setSelectedTeacher] = React.useState<typeof mockTeachers[0] | null>(null)

    const filteredTeachers = mockTeachers.filter((teacher) => {
        const matchesSearch =
            teacher.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.phoneNumber.includes(searchQuery)
        const matchesStatus =
            statusFilter === "all" || teacher.status === parseInt(statusFilter)
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1:
                return (
                    <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                        {t("teachers.pending")}
                    </Badge>
                )
            case 2:
                return (
                    <Badge variant="outline" className="border-success text-success bg-success/10">
                        {t("teachers.active")}
                    </Badge>
                )
            case 3:
                return (
                    <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">
                        {t("teachers.blocked")}
                    </Badge>
                )
            default:
                return null
        }
    }

    const handleBlockTeacher = (teacher: typeof mockTeachers[0]) => {
        setSelectedTeacher(teacher)
        setBlockDialogOpen(true)
    }

    const confirmBlockTeacher = () => {
        // In a real app, this would call the API: POST /api/teachers/{teacherId}/block
        console.log("[v0] Blocking teacher:", selectedTeacher?.teacherId)
        setBlockDialogOpen(false)
        setSelectedTeacher(null)
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
                            <CardTitle className="text-2xl">{mockTeachers.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t("teachers.pending")}</CardDescription>
                            <CardTitle className="text-2xl text-warning">
                                {mockTeachers.filter((t) => t.status === 1).length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t("teachers.active")}</CardDescription>
                            <CardTitle className="text-2xl text-success">
                                {mockTeachers.filter((t) => t.status === 2).length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>{t("teachers.blocked")}</CardDescription>
                            <CardTitle className="text-2xl text-destructive">
                                {mockTeachers.filter((t) => t.status === 3).length}
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
                                    <SelectItem value="1">{t("teachers.pending")}</SelectItem>
                                    <SelectItem value="2">{t("teachers.active")}</SelectItem>
                                    <SelectItem value="3">{t("teachers.blocked")}</SelectItem>
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
                                                {locationNames[teacher.location]?.[locale] || teacher.location}
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
                                                        <DropdownMenuSeparator />
                                                        {teacher.status !== 3 ? (
                                                            <DropdownMenuItem
                                                                className="text-destructive"
                                                                onClick={() => handleBlockTeacher(teacher)}
                                                            >
                                                                <IconBan className="h-4 w-4 me-2" />
                                                                {t("teachers.blockTeacher")}
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem className="text-success">
                                                                <IconCheck className="h-4 w-4 me-2" />
                                                                {t("teachers.unblockTeacher")}
                                                            </DropdownMenuItem>
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
            <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
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
