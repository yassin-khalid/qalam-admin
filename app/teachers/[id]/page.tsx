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
import { cn, queryClient } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useLocale } from "@/lib/locale-context"
import { useMutation, useQuery } from "@tanstack/react-query"
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
import { toast } from "sonner"
import { ApiResponse } from "@/types/ApiResponse"
import {
    LocationValue,
    TEACHER_STATUS,
    locationLabelKey,
    normalizeLocation,
    normalizeTeacherStatus,
    normalizeVerificationStatus,
} from "@/lib/teacher-status"

const identityTypeNames: Record<number, { en: string; ar: string }> = {
    1: { en: "National ID", ar: "الهوية الوطنية" },
    2: { en: "Passport", ar: "جواز السفر" },
    3: { en: "Iqama", ar: "الإقامة" },
}

export default function TeacherDetailPage() {
    const { t, locale, direction } = useLocale()
    const params = useParams()
    const teacherId = params.id

    const [blockDialogOpen, setBlockDialogOpen] = React.useState(false)
    const [approveDialogOpen, setApproveDialogOpen] = React.useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false)
    const [selectedDocument, setSelectedDocument] = React.useState<TeacherDetail['documents'][number] | null>(null)
    const [rejectionReason, setRejectionReason] = React.useState("")
    const [blockReason, setBlockReason] = React.useState("")

    // const { data: teacherDocuments } = useLiveQuery(q => q.from({ teacherDocuments: teacherDocumentsCollection(parseInt(params.id as string)) }))
    // const { data: teacherPreview } = useLiveQuery(q => q.from({ teacher: teacherColllection }).where(({ teacher }) => eq(teacher.teacherId, parseInt(params.id as string))).findOne())

    // const teacher = {
    //     ...teacherPreview,
    //     documents: teacherDocuments,
    // }

    type TeacherDetail = {
        teacherId: number,
        userId: number,
        fullName: string,
        phoneNumber: string,
        email: string,
        bio: string | null,
        status: number,
        location: LocationValue,
        createdAt: string,
        documents: {
            id: number,
            documentType: number,
            filePath: string,
            verificationStatus: number,
            rejectionReason: string | null,
            reviewedAt: string | null,
            documentNumber: string | null,
            identityType: number | null,
            issuingCountryCode: null,
            certificateTitle: string | null,
            issuer: string | null,
            issueDate: string | null,
            createdAt: string,
        }[],
        totalDocuments: number,
        pendingDocuments: number,
        approvedDocuments: number,
        rejectedDocuments: number,
        canBeActivated: boolean
        registrationRequirements?: {
            code: string
            nameEn?: string | null
            nameAr?: string | null
            requirementType?: string | null
            isRequired: boolean
            isSubmitted: boolean
            verificationStatus: string | null
            rejectionReason?: string | null
            teacherDocumentId?: number | null
        }[]
    }

    const { data: teacher } = useQuery({
        queryKey: ['teacher', teacherId],
        queryFn: async () => {
            const access_token = localStorage.getItem('access_token');
            const locale = localStorage.getItem('locale');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherManagement/${teacherId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                    'Accept': 'application/json',
                    'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
                },
            })
            // status/location/document verificationStatus arrive as string enums
            // (or numbers) — normalize to the canonical numeric codes the UI expects.
            type RawTeacherDetail = Omit<TeacherDetail, "status" | "location" | "documents"> & {
                status: string | number
                location: string | number | boolean | null
                documents: (Omit<TeacherDetail["documents"][number], "verificationStatus"> & {
                    verificationStatus: string | number
                })[]
            }
            const data: ApiResponse<RawTeacherDetail | null> = await response.json()
            if (!data.succeeded) {
                throw new Error(data.message)
            }
            if (!data.data) return null
            return {
                ...data.data,
                status: normalizeTeacherStatus(data.data.status),
                location: normalizeLocation(data.data.location),
                documents: (data.data.documents ?? []).map((doc) => ({
                    ...doc,
                    verificationStatus: normalizeVerificationStatus(doc.verificationStatus),
                })),
            } satisfies TeacherDetail
        },
    })

    const { mutate: approveDocument } = useMutation({
        mutationFn: async ({ teacherId, documentId }: { teacherId: number, documentId: number }) => {
            const access_token = localStorage.getItem('access_token');
            const locale = localStorage.getItem('locale');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherManagement/${teacherId}/Documents/${documentId}/Approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                    'Accept': 'application/json',
                    'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
                },
            });
            const data = await response.json() as ApiResponse<null>
            if (!data.succeeded) {
                throw new Error(data.message);
            }
            return data.message;
        },
        onMutate: async ({ documentId, teacherId }) => {
            await queryClient.cancelQueries({ queryKey: ['teacher', teacherId] })
            const previousData = queryClient.getQueryData<TeacherDetail | null>(['teacher', teacherId])
            if (previousData) {
                queryClient.setQueryData<TeacherDetail | null>(['teacher', teacherId], (old) => {
                    if (!old) return null;
                    return {
                        ...old,
                        documents: old.documents.map(doc => doc.id === documentId ?
                            { ...doc, verificationStatus: 2 } : doc),
                    }
                })
            }
        },
        onSuccess: (message) => {
            toast.success(message || t("teachers.documentApprovedSuccess"))
            queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] })
        },
        onError: (error: Error) => {
            toast.error(error.message || t("teachers.documentApproveError"))
        },
    })

    const { mutate: rejectDocument } = useMutation({
        mutationFn: async ({ teacherId, documentId, reason }: { teacherId: number, documentId: number, reason: string }) => {
            const access_token = localStorage.getItem('access_token');
            const locale = localStorage.getItem('locale');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Admin/TeacherManagement/${teacherId}/Documents/${documentId}/Reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`,
                    'Accept': 'application/json',
                    'Accept-Language': locale === 'ar' ? 'ar-EG' : 'en-US',
                },
                body: JSON.stringify({ reason }),
            });
            const data = await response.json() as ApiResponse<null>
            if (!data.succeeded) {
                throw new Error(data.message);
            }
            return data.message;
        },
        onMutate: async ({ documentId, teacherId, reason }) => {
            await queryClient.cancelQueries({ queryKey: ['teacher', teacherId] })
            const previousData = queryClient.getQueryData<TeacherDetail | null>(['teacher', teacherId])
            if (previousData) {
                queryClient.setQueryData<TeacherDetail | null>(['teacher', teacherId], (old) => {
                    if (!old) return null;
                    return {
                        ...old,
                        documents: old.documents.map(doc => doc.id === documentId ?
                            { ...doc, verificationStatus: 3, rejectionReason: reason } : doc),
                    }
                })
            }
        },
        onSuccess: (message) => {
            toast.success(message || t("teachers.documentRejectedSuccess"))
            queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] })
        },
        onError: (error: Error) => {
            toast.error(error.message || t("teachers.documentRejectError"))
        },
    })

    const { mutate: blockTeacher } = useMutation({
        mutationFn: async ({ teacherId, reason }: { teacherId: number, reason?: string }) => {
            const access_token = localStorage.getItem('access_token');
            const locale = localStorage.getItem('locale');
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
            await queryClient.cancelQueries({ queryKey: ['teacher', teacherId] })
            const previousData = queryClient.getQueryData<TeacherDetail | null>(['teacher', teacherId])
            if (previousData) {
                queryClient.setQueryData<TeacherDetail | null>(['teacher', teacherId], (old) => {
                    if (!old) return null;
                    return {
                        ...old,
                        status: TEACHER_STATUS.Blocked,
                    }
                })
            }
        },
        onSuccess: (message) => {
            toast.success(message || t("teachers.teacherBlockedSuccess"))
            queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] })
        },
        onError: (error: Error) => {
            toast.error(error.message || t("teachers.teacherBlockError"))
        },
    })

    // Activation is automatic on the backend: approving the last required document
    // flips the teacher to Active (see Teacher-Registration-Guide, Step C). Surface
    // that transition with a one-time toast so the admin sees it happen.
    const prevStatusRef = React.useRef<number | undefined>(undefined)
    React.useEffect(() => {
        const current = teacher?.status
        if (
            prevStatusRef.current !== undefined &&
            prevStatusRef.current !== TEACHER_STATUS.Active &&
            current === TEACHER_STATUS.Active
        ) {
            toast.success(t("teachers.teacherActivatedSuccess"))
        }
        prevStatusRef.current = current
    }, [teacher?.status, t])

    const BackArrow = direction === "rtl" ? IconArrowRight : IconArrowLeft

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1:
                return (
                    <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                        {t("teachers.awaiting")}
                    </Badge>
                )
            case 2:
                return (
                    <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                        {t("teachers.pending")}
                    </Badge>
                )
            case 3:
                return (
                    <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">
                        {t("teachers.rejected")}
                    </Badge>
                )
            case 4:
                return (
                    <Badge variant="outline" className="border-success text-success bg-success/10">
                        {t("teachers.active")}
                    </Badge>
                )
            case 5:
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

    const getDocumentTypeName = (type: number | null | undefined) => {
        switch (type) {
            case 1:
                return t("teachers.identityDocument")
            case 2:
                return t("teachers.certificate")
            case 3:
                return t("treq.docOther")
            default:
                return t("teachers.document")
        }
    }

    const systemCodeLabels: Record<string, string> = {
        identity_document: t("teachers.identityDocument"),
        certificate: t("teachers.certificate"),
        bio: t("teachers.bio"),
        location: t("teachers.location"),
    }

    const getRequirementLabel = (req: NonNullable<TeacherDetail["registrationRequirements"]>[number]) => {
        const localized = locale === "ar" ? req.nameAr : req.nameEn
        return localized || systemCodeLabels[req.code] || req.code
    }

    // Map each uploaded document to the requirement it satisfies (via teacherDocumentId),
    // so we can show a meaningful name even for custom requirements.
    const requirementByDocId = React.useMemo(() => {
        const map = new Map<number, NonNullable<TeacherDetail["registrationRequirements"]>[number]>()
        teacher?.registrationRequirements?.forEach((req) => {
            if (req.teacherDocumentId != null) map.set(req.teacherDocumentId, req)
        })
        return map
    }, [teacher?.registrationRequirements])

    const getDocumentName = (doc: TeacherDetail["documents"][number]) => {
        const req = requirementByDocId.get(doc.id)
        return req ? getRequirementLabel(req) : getDocumentTypeName(doc.documentType)
    }

    // A real uploaded file has a path (slash or extension). The backend stores
    // sentinels like "pending-upload" when no file exists yet — don't link those.
    const getDocumentFileUrl = (filePath: string | null | undefined) => {
        if (!filePath) return null
        const looksLikePath = filePath.includes("/") || /\.[a-z0-9]+$/i.test(filePath)
        if (!looksLikePath) return null
        const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "")
        return `${base}/${filePath.replace(/^\/+/, "")}`
    }

    // Status here is the string form ("Pending" | "Approved" | "Rejected") used by the checklist.
    const getRequirementStatusBadge = (req: NonNullable<TeacherDetail["registrationRequirements"]>[number]) => {
        if (!req.isSubmitted) {
            return (
                <Badge variant="outline" className="border-muted-foreground/40 text-muted-foreground bg-muted">
                    {t("treq.notSubmitted")}
                </Badge>
            )
        }
        switch (req.verificationStatus) {
            case "Approved":
                return (
                    <Badge variant="outline" className="border-success text-success bg-success/10">
                        <IconCheck className="h-3 w-3 me-1" />
                        {t("teachers.approved")}
                    </Badge>
                )
            case "Rejected":
                return (
                    <Badge variant="outline" className="border-destructive text-destructive bg-destructive/10">
                        <IconX className="h-3 w-3 me-1" />
                        {t("teachers.rejected")}
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                        <IconClock className="h-3 w-3 me-1" />
                        {t("teachers.pending")}
                    </Badge>
                )
        }
    }

    const handleApproveDocument = (doc: TeacherDetail['documents'][0]) => {
        setSelectedDocument(doc)
        setApproveDialogOpen(true)
    }

    const handleRejectDocument = (doc: TeacherDetail['documents'][0]) => {
        setSelectedDocument(doc)
        setRejectDialogOpen(true)
        setRejectionReason("")
    }

    const confirmApprove = () => {
        if (!selectedDocument) return
        approveDocument({ teacherId: Number(teacherId), documentId: selectedDocument.id })
        setApproveDialogOpen(false)
        setSelectedDocument(null)
    }

    const confirmReject = () => {
        if (!rejectionReason.trim()) {
            return
        }
        if (!selectedDocument) return
        rejectDocument({ teacherId: Number(teacherId), documentId: selectedDocument.id, reason: rejectionReason })
        setRejectDialogOpen(false)
        setSelectedDocument(null)
        setRejectionReason("")
    }

    const confirmBlockTeacher = () => {
        blockTeacher({ teacherId: Number(teacherId), reason: blockReason })
        setBlockDialogOpen(false)
        setBlockReason("")
    }

    // No activate endpoint exists — activation happens automatically when the last
    // required document is approved. This affordance just confirms by re-fetching
    // the latest status from the server.
    const confirmActivation = () => {
        queryClient.invalidateQueries({ queryKey: ['teacher', teacherId] })
        toast.info(t("teachers.activationAutomaticHint"))
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
                        {teacher?.status !== TEACHER_STATUS.Blocked && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setBlockDialogOpen(true)}
                            >
                                <IconBan className="h-4 w-4 me-2" />
                                {t("teachers.blockTeacher")}
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
                                        {teacher?.fullName?.split(" ").map((n) => n[0]).join("") || ""}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="mt-4 text-lg font-semibold">{teacher?.fullName}</h3>
                                <div className="mt-2">{getStatusBadge(teacher?.status || 0)}</div>
                            </div>

                            <Separator />

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                        <IconMail className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">{t("teachers.email")}</p>
                                        <p className="text-sm font-medium truncate">{teacher?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                        <IconPhone className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">{t("teachers.phoneNumber")}</p>
                                        <p className="text-sm font-medium" dir="ltr">{teacher?.phoneNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                        <IconMapPin className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-muted-foreground">{t("teachers.location")}</p>
                                        <p className="text-sm font-medium">
                                            {(() => {
                                                const key = locationLabelKey(teacher?.location ?? null)
                                                return key ? t(key) : (teacher?.location ?? "—")
                                            })()}
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
                                            {teacher?.createdAt && new Date(teacher.createdAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {teacher?.bio && (
                                    <>
                                        <Separator />
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-2">{t("teachers.bio")}</p>
                                            <p className="text-sm">{teacher?.bio || ""}</p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right column: registration checklist + documents */}
                    <div className="lg:col-span-2 space-y-6">
                    {/* Registration Requirements Checklist */}
                    {teacher?.registrationRequirements && teacher.registrationRequirements.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("treq.checklistTitle")}</CardTitle>
                                <CardDescription className="mt-1">{t("treq.checklistSubtitle")}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {teacher.registrationRequirements.map((req) => (
                                    <div
                                        key={req.code}
                                        className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="font-medium text-foreground truncate">
                                                {getRequirementLabel(req)}
                                            </span>
                                            {req.isRequired && (
                                                <Badge variant="outline" className="border-primary text-primary bg-primary/10 shrink-0">
                                                    {t("treq.required")}
                                                </Badge>
                                            )}
                                        </div>
                                        {getRequirementStatusBadge(req)}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Documents Section */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{t("teachers.documents")}</CardTitle>
                                    <CardDescription className="mt-1">
                                        {t("teachers.documentSummary")}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{teacher?.totalDocuments || 0} {t("teachers.totalDocuments")}</Badge>
                                </div>
                            </div>
                            {/* Document Stats */}
                            <div className="flex flex-wrap gap-3 mt-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-sm">
                                    <IconClock className="h-4 w-4" />
                                    <span>{teacher?.pendingDocuments || 0} {t("teachers.pendingDocuments")}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 text-success text-sm">
                                    <IconCheck className="h-4 w-4" />
                                    <span>{teacher?.approvedDocuments || 0} {t("teachers.approvedDocuments")}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm">
                                    <IconX className="h-4 w-4" />
                                    <span>{teacher?.rejectedDocuments || 0} {t("teachers.rejectedDocuments")}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {teacher?.documents.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <IconFileText className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">{t("teachers.noDocuments")}</p>
                                </div>
                            ) : (
                                teacher?.documents.map((doc) => (
                                    <Card key={doc.id} className="border-border">
                                        <CardContent className="p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted shrink-0">
                                                        {doc.documentType === 1 || requirementByDocId.get(doc.id)?.code === "identity_document" ? (
                                                            <IconShield className="h-6 w-6 text-muted-foreground" />
                                                        ) : (
                                                            <IconFileText className="h-6 w-6 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-medium">{getDocumentName(doc)}</h4>
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
                                                    {(() => {
                                                        const fileUrl = getDocumentFileUrl(doc.filePath)
                                                        return fileUrl ? (
                                                            <a
                                                                href={fileUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                                                            >
                                                                <IconExternalLink className="h-4 w-4 me-2" />
                                                                {t("teachers.viewDocument")}
                                                            </a>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                                <IconAlertCircle className="h-4 w-4" />
                                                                {t("teachers.fileNotUploaded")}
                                                            </span>
                                                        )
                                                    })()}
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
                            {(() => {
                                const isActive = teacher?.status === TEACHER_STATUS.Active
                                const canActivate = !!teacher?.canBeActivated
                                // Three states: already Active, ready to activate, or blocked on documents.
                                const tone = isActive || canActivate ? "success" : "muted"
                                const title = isActive
                                    ? t("teachers.teacherActive")
                                    : canActivate
                                        ? t("teachers.canBeActivated")
                                        : t("teachers.cannotBeActivated")
                                const description = isActive
                                    ? t("teachers.teacherActiveHint")
                                    : canActivate
                                        ? t("teachers.canBeActivatedHint")
                                        : t("teachers.cannotBeActivatedHint")
                                return (
                                    <Card className={`border-2 ${tone === "success" ? "border-success bg-success/5" : "border-muted bg-muted/50"}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${tone === "success" ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}>
                                                        {tone === "success" ? <IconCheck className="h-5 w-5" /> : <IconAlertCircle className="h-5 w-5" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{title}</p>
                                                        <p className="text-sm text-muted-foreground">{description}</p>
                                                    </div>
                                                </div>
                                                {/* Activation is automatic — this button just confirms by re-fetching status. */}
                                                {canActivate && !isActive && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-success text-success-foreground hover:bg-success/90 shrink-0"
                                                        onClick={confirmActivation}
                                                    >
                                                        <IconCheck className="h-4 w-4 me-2" />
                                                        {t("teachers.activateTeacher")}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })()}
                        </CardContent>
                    </Card>
                    </div>
                </div>
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
                            <span className="block mt-2 font-medium text-foreground">
                                {teacher?.fullName} ({teacher?.email || ""})
                            </span>
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
                                maxLength={500}
                            />
                            <p className="text-xs text-muted-foreground text-end">{rejectionReason.length}/500</p>
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
