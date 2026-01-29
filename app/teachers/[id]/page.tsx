"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
    IconArrowLeft,
    IconArrowRight,
    IconBan,
    IconCheck,
    IconX,
    IconFileText,
    IconMail,
    IconPhone,
    IconMapPin,
    IconCalendar,
    IconShield,
    IconExternalLink,
    IconClock,
    IconAlertCircle,
} from "@tabler/icons-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock teacher detail data
const mockTeacherDetail = {
    teacherId: 1,
    userId: 2,
    fullName: "Ahmed Al-Farsi",
    phoneNumber: "+966554709484",
    email: "ahmed.alfarsi@qalam.com",
    bio: "Experienced mathematics teacher with 10 years of teaching experience in secondary education.",
    status: 1, // 1: Pending, 2: Active, 3: Blocked
    location: 1,
    createdAt: "2026-01-29T03:16:58.38936",
    documents: [
        {
            id: 1,
            documentType: 1, // 1: Identity, 2: Certificate
            filePath: "uploads/teachers/1/identity/ed928a64-d1b6-455e-a5b2-35fd698ae8e9.png",
            verificationStatus: 1, // 1: Pending, 2: Approved, 3: Rejected
            rejectionReason: null,
            reviewedAt: null,
            documentNumber: "1234567890",
            identityType: 1, // 1: National ID, 2: Passport, 3: Iqama
            issuingCountryCode: "SA",
            certificateTitle: null,
            issuer: null,
            issueDate: null,
            createdAt: "2026-01-29T03:19:48.0781665",
        },
        {
            id: 2,
            documentType: 2,
            filePath: "uploads/teachers/1/certificates/dd9e01d2-478f-44d6-8567-4f8c87f6b8c6.png",
            verificationStatus: 1,
            rejectionReason: null,
            reviewedAt: null,
            documentNumber: null,
            identityType: null,
            issuingCountryCode: null,
            certificateTitle: "Bachelor of Science in Mathematics Education",
            issuer: "King Saud University",
            issueDate: "2016-05-15",
            createdAt: "2026-01-29T03:19:48.144917",
        },
    ],
    totalDocuments: 2,
    pendingDocuments: 2,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    canBeActivated: false,
}

const locationNames: Record<number, { en: string; ar: string }> = {
    1: { en: "Riyadh", ar: "الرياض" },
    2: { en: "Jeddah", ar: "جدة" },
    3: { en: "Dammam", ar: "الدمام" },
}

const identityTypeNames: Record<number, { en: string; ar: string }> = {
    1: { en: "National ID", ar: "الهوية الوطنية" },
    2: { en: "Passport", ar: "جواز السفر" },
    3: { en: "Iqama", ar: "الإقامة" },
}

export default function TeacherDetailPage() {
    const { t, locale, direction } = useLocale()
    const params = useParams()
    const teacherId = params.id

    const [teacher] = React.useState(mockTeacherDetail)
    const [blockDialogOpen, setBlockDialogOpen] = React.useState(false)
    const [approveDialogOpen, setApproveDialogOpen] = React.useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false)
    const [selectedDocument, setSelectedDocument] = React.useState<typeof mockTeacherDetail.documents[0] | null>(null)
    const [rejectionReason, setRejectionReason] = React.useState("")

    const BackArrow = direction === "rtl" ? IconArrowRight : IconArrowLeft

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

    const getVerificationBadge = (status: number) => {
        switch (status) {
            case 1:
                return (
                    <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                        <IconClock className="h-3 w-3 me-1" />
                        {t("teachers.pending")}
                    </Badge>
                )
            case 2:
                return (
                    <Badge variant="outline" className="border-success text-success bg-success/10">
                        <IconCheck className="h-3 w-3 me-1" />
                        {t("teachers.approved")}
                    </Badge>
                )
            case 3:
                return (
                    <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">
                        <IconX className="h-3 w-3 me-1" />
                        {t("teachers.rejected")}
                    </Badge>
                )
            default:
                return null
        }
    }

    const getDocumentTypeName = (type: number) => {
        switch (type) {
            case 1:
                return t("teachers.identityDocument")
            case 2:
                return t("teachers.certificate")
            default:
                return "Unknown"
        }
    }

    const handleApproveDocument = (doc: typeof mockTeacherDetail.documents[0]) => {
        setSelectedDocument(doc)
        setApproveDialogOpen(true)
    }

    const handleRejectDocument = (doc: typeof mockTeacherDetail.documents[0]) => {
        setSelectedDocument(doc)
        setRejectDialogOpen(true)
        setRejectionReason("")
    }

    const confirmApprove = () => {
        // API call: POST /api/teachers/{teacherId}/documents/{documentId}/approve
        console.log("[v0] Approving document:", {
            teacherId: teacher.teacherId,
            documentId: selectedDocument?.id,
        })
        setApproveDialogOpen(false)
        setSelectedDocument(null)
    }

    const confirmReject = () => {
        if (!rejectionReason.trim()) {
            return
        }
        // API call: POST /api/teachers/{teacherId}/documents/{documentId}/reject
        console.log("[v0] Rejecting document:", {
            teacherId: teacher.teacherId,
            documentId: selectedDocument?.id,
            reason: rejectionReason,
        })
        setRejectDialogOpen(false)
        setSelectedDocument(null)
        setRejectionReason("")
    }

    const confirmBlockTeacher = () => {
        // API call: POST /api/teachers/{teacherId}/block
        console.log("[v0] Blocking teacher:", teacher.teacherId)
        setBlockDialogOpen(false)
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/teachers"
                            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                        >
                            <BackArrow className="h-4 w-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">{t("teachers.teacherDetails")}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">ID: {teacherId}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {teacher.status !== 3 ? (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setBlockDialogOpen(true)}
                            >
                                <IconBan className="h-4 w-4 me-2" />
                                {t("teachers.blockTeacher")}
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" className="text-success border-success hover:bg-success/10 bg-transparent">
                                <IconCheck className="h-4 w-4 me-2" />
                                {t("teachers.unblockTeacher")}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Teacher Info Card */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>{t("form.basicInfo")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center text-center">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src="/placeholder-avatar.jpg" />
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                                        {teacher.fullName.split(" ").map((n) => n[0]).join("")}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="mt-4 text-lg font-semibold">{teacher.fullName}</h3>
                                <div className="mt-2">{getStatusBadge(teacher.status)}</div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                        <IconMail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">{t("teachers.email")}</p>
                                        <p className="text-sm font-medium truncate">{teacher.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                        <IconPhone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">{t("teachers.phoneNumber")}</p>
                                        <p className="text-sm font-medium" dir="ltr">{teacher.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                        <IconMapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">{t("teachers.location")}</p>
                                        <p className="text-sm font-medium">
                                            {locationNames[teacher.location]?.[locale] || teacher.location}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">{t("common.createdAt")}</p>
                                        <p className="text-sm font-medium">
                                            {new Date(teacher.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {teacher.bio && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-2">{t("teachers.bio")}</p>
                                            <p className="text-sm">{teacher.bio}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Documents Section */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{t("teachers.documents")}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {t("teachers.documentSummary")}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{teacher.totalDocuments} {t("teachers.totalDocuments")}</Badge>
                                </div>
                            </div>
                            {/* Document Stats */}
                            <div className="flex flex-wrap gap-3 mt-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-sm">
                                    <IconClock className="h-4 w-4" />
                                    <span>{teacher.pendingDocuments} {t("teachers.pendingDocuments")}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm">
                                    <IconCheck className="h-4 w-4" />
                                    <span>{teacher.approvedDocuments} {t("teachers.approvedDocuments")}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    <IconX className="h-4 w-4" />
                                    <span>{teacher.rejectedDocuments} {t("teachers.rejectedDocuments")}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {teacher.documents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <IconFileText className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">{t("teachers.noDocuments")}</p>
                                </div>
                            ) : (
                                teacher.documents.map((doc) => (
                                    <Card key={doc.id} className="border-border">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted shrink-0">
                                                        {doc.documentType === 1 ? (
                                                            <IconShield className="h-6 w-6 text-muted-foreground" />
                                                        ) : (
                                                            <IconFileText className="h-6 w-6 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-medium">{getDocumentTypeName(doc.documentType)}</h4>
                                                            {getVerificationBadge(doc.verificationStatus)}
                                                        </div>

                                                        {/* Document Details */}
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            {doc.documentType === 1 && (
                                                                <>
                                                                    {doc.identityType && (
                                                                        <p>
                                                                            <span className="font-medium">{t("teachers.identityType")}:</span>{" "}
                                                                            {identityTypeNames[doc.identityType]?.[locale] || doc.identityType}
                                                                        </p>
                                                                    )}
                                                                    {doc.documentNumber && (
                                                                        <p>
                                                                            <span className="font-medium">{t("teachers.documentNumber")}:</span>{" "}
                                                                            <span dir="ltr">{doc.documentNumber}</span>
                                                                        </p>
                                                                    )}
                                                                </>
                                                            )}
                                                            {doc.documentType === 2 && (
                                                                <>
                                                                    {doc.certificateTitle && (
                                                                        <p>
                                                                            <span className="font-medium">{t("teachers.certificateTitle")}:</span>{" "}
                                                                            {doc.certificateTitle}
                                                                        </p>
                                                                    )}
                                                                    {doc.issuer && (
                                                                        <p>
                                                                            <span className="font-medium">{t("teachers.issuer")}:</span>{" "}
                                                                            {doc.issuer}
                                                                        </p>
                                                                    )}
                                                                    {doc.issueDate && (
                                                                        <p>
                                                                            <span className="font-medium">{t("teachers.issueDate")}:</span>{" "}
                                                                            {new Date(doc.issueDate).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                                                                        </p>
                                                                    )}
                                                                </>
                                                            )}
                                                            <p className="text-xs">
                                                                <span className="font-medium">{t("common.createdAt")}:</span>{" "}
                                                                {new Date(doc.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                                                            </p>
                                                            {doc.reviewedAt && (
                                                                <p className="text-xs">
                                                                    <span className="font-medium">{t("teachers.reviewedAt")}:</span>{" "}
                                                                    {new Date(doc.reviewedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                                                                </p>
                                                            )}
                                                            {doc.rejectionReason && (
                                                                <div className="flex items-start gap-1 text-destructive mt-2">
                                                                    <IconAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                                                    <p>
                                                                        <span className="font-medium">{t("teachers.rejectionReason")}:</span>{" "}
                                                                        {doc.rejectionReason}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <a
                                                        href={`/${doc.filePath}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                                                    >
                                                        <IconExternalLink className="h-4 w-4 me-2" />
                                                        {t("teachers.viewDocument")}
                                                    </a>
                                                    {doc.verificationStatus === 1 && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-success border-success hover:bg-success/10 bg-transparent"
                                                                onClick={() => handleApproveDocument(doc)}
                                                            >
                                                                <IconCheck className="h-4 w-4 me-2" />
                                                                {t("teachers.approveDocument")}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
                                                                onClick={() => handleRejectDocument(doc)}
                                                            >
                                                                <IconX className="h-4 w-4 me-2" />
                                                                {t("teachers.rejectDocument")}
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}

                            {/* Activation Status */}
                            <Card className={`border-2 ${teacher.canBeActivated ? "border-success bg-success/5" : "border-muted bg-muted/50"}`}>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${teacher.canBeActivated ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                                            {teacher.canBeActivated ? <IconCheck className="h-5 w-5" /> : <IconAlertCircle className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {teacher.canBeActivated ? t("teachers.canBeActivated") : t("teachers.cannotBeActivated")}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {teacher.canBeActivated
                                                    ? locale === "ar"
                                                        ? "جميع الوثائق معتمدة ويمكن تفعيل المعلم"
                                                        : "All documents approved, teacher can be activated"
                                                    : locale === "ar"
                                                        ? "يجب اعتماد جميع الوثائق لتفعيل المعلم"
                                                        : "All documents must be approved to activate teacher"}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Block Teacher Dialog */}
            <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("teachers.blockTeacher")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("teachers.confirmBlock")}
                            <span className="block mt-2 font-medium text-foreground">
                                {teacher.fullName} ({teacher.email})
                            </span>
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

            {/* Approve Document Dialog */}
            <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("teachers.approveDocument")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("teachers.confirmApprove")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmApprove}
                            className="bg-success text-success-foreground hover:bg-success/90"
                        >
                            {t("teachers.approveDocument")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Document Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("teachers.rejectDocument")}</DialogTitle>
                        <DialogDescription>
                            {t("teachers.confirmReject")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejectionReason">{t("teachers.rejectionReason")}</Label>
                            <Textarea
                                id="rejectionReason"
                                placeholder={t("teachers.enterRejectionReason")}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmReject}
                            disabled={!rejectionReason.trim()}
                        >
                            {t("teachers.rejectDocument")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    )
}
