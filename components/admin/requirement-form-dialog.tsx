"use client"

import * as React from "react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { IconDeviceFloppy, IconLoader2, IconLock } from "@tabler/icons-react"
import { useLocale } from "@/lib/locale-context"
import {
    MapsToDocumentType,
    RequirementTypeName,
    TeacherRegistrationRequirement,
} from "@/collections/teacher-requirements"

type RequirementFormValue = Omit<TeacherRegistrationRequirement, "id" | "isSystem" | "createdAt">

interface RequirementFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    // null => create mode
    requirement: TeacherRegistrationRequirement | null
    onSubmit: (value: RequirementFormValue) => Promise<void>
}

const emptyForm: RequirementFormValue = {
    code: "",
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    requirementType: "File",
    isActive: true,
    isRequired: false,
    sortOrder: 0,
    minCount: 1,
    maxCount: 1,
    maxFileSizeBytes: 10485760,
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png"],
    maxLength: null,
    mapsToDocumentType: 3,
}

const BYTES_IN_MB = 1024 * 1024

export function RequirementFormDialog({
    open,
    onOpenChange,
    requirement,
    onSubmit,
}: RequirementFormDialogProps) {
    const { t, direction } = useLocale()
    const isEdit = requirement !== null

    const [form, setForm] = React.useState<RequirementFormValue>(emptyForm)
    const [extensionsText, setExtensionsText] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [errors, setErrors] = React.useState<Record<string, string>>({})

    // Reset the form whenever the drawer opens (with or without an existing row).
    React.useEffect(() => {
        if (!open) return
        const base: RequirementFormValue = requirement
            ? {
                  code: requirement.code,
                  nameEn: requirement.nameEn,
                  nameAr: requirement.nameAr,
                  descriptionEn: requirement.descriptionEn,
                  descriptionAr: requirement.descriptionAr,
                  requirementType: requirement.requirementType,
                  isActive: requirement.isActive,
                  isRequired: requirement.isRequired,
                  sortOrder: requirement.sortOrder,
                  minCount: requirement.minCount,
                  maxCount: requirement.maxCount,
                  maxFileSizeBytes: requirement.maxFileSizeBytes,
                  allowedExtensions: requirement.allowedExtensions,
                  maxLength: requirement.maxLength,
                  mapsToDocumentType: requirement.mapsToDocumentType,
              }
            : { ...emptyForm }
        setForm(base)
        setExtensionsText((base.allowedExtensions ?? []).join(", "))
        setErrors({})
    }, [open, requirement])

    const update = <K extends keyof RequirementFormValue>(key: K, value: RequirementFormValue[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }))
        if (errors[key as string]) {
            setErrors((prev) => {
                const next = { ...prev }
                delete next[key as string]
                return next
            })
        }
    }

    const validate = () => {
        const next: Record<string, string> = {}
        if (!form.code.trim()) next.code = t("form.required")
        else if (!/^[a-z0-9_]+$/.test(form.code)) next.code = t("treq.codeInvalid")
        if (!form.nameEn.trim()) next.nameEn = t("form.required")
        if (!form.nameAr.trim()) next.nameAr = t("form.required")
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async () => {
        if (!validate()) return
        setIsSubmitting(true)
        try {
            await onSubmit(form)
            onOpenChange(false)
        } catch (error) {
            console.error("Requirement submission error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const isFile = form.requirementType === "File"
    const isText = form.requirementType === "Text"

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={direction === "rtl" ? "left" : "right"}
                className="w-full sm:max-w-md"
            >
                <SheetHeader className="border-b border-border">
                    <SheetTitle>{isEdit ? t("treq.editTitle") : t("treq.createTitle")}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? t("treq.editSubtitle") : t("treq.createSubtitle")}
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1 min-h-0 px-4">
                    <div className="space-y-5 py-2">
                        {/* Code */}
                        <div className="space-y-2">
                            <Label htmlFor="code" className="text-foreground">
                                {t("treq.code")}
                                <span className="text-destructive ms-1">*</span>
                            </Label>
                            <Input
                                id="code"
                                value={form.code}
                                placeholder="custom_cv"
                                disabled={isEdit}
                                dir="ltr"
                                onChange={(e) => update("code", e.target.value)}
                                className="bg-secondary border-0 disabled:opacity-70"
                            />
                            <p className="text-xs text-muted-foreground">
                                {isEdit ? t("treq.codeImmutable") : t("treq.codeHint")}
                            </p>
                            {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                        </div>

                        {/* Type */}
                        <div className="space-y-2">
                            <Label className="text-foreground">{t("treq.type")}</Label>
                            <Select
                                value={form.requirementType}
                                onValueChange={(value) =>
                                    update("requirementType", (value as RequirementTypeName) ?? "File")
                                }
                                disabled={isEdit}
                            >
                                <SelectTrigger className="bg-secondary border-0 disabled:opacity-70">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="File">{t("treq.typeFile")}</SelectItem>
                                    <SelectItem value="Text">{t("treq.typeText")}</SelectItem>
                                    <SelectItem value="Boolean">{t("treq.typeBoolean")}</SelectItem>
                                </SelectContent>
                            </Select>
                            {isEdit && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <IconLock className="h-3 w-3" />
                                    {t("treq.typeImmutable")}
                                </p>
                            )}
                        </div>

                        {/* Names */}
                        <div className="space-y-2">
                            <Label htmlFor="nameEn" className="text-foreground">
                                {t("domains.nameEn")}
                                <span className="text-destructive ms-1">*</span>
                            </Label>
                            <Input
                                id="nameEn"
                                value={form.nameEn}
                                onChange={(e) => update("nameEn", e.target.value)}
                                className="bg-secondary border-0"
                            />
                            {errors.nameEn && <p className="text-sm text-destructive">{errors.nameEn}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nameAr" className="text-foreground">
                                {t("domains.nameAr")}
                                <span className="text-destructive ms-1">*</span>
                            </Label>
                            <Input
                                id="nameAr"
                                dir="rtl"
                                value={form.nameAr}
                                onChange={(e) => update("nameAr", e.target.value)}
                                className="bg-secondary border-0"
                            />
                            {errors.nameAr && <p className="text-sm text-destructive">{errors.nameAr}</p>}
                        </div>

                        {/* Descriptions */}
                        <div className="space-y-2">
                            <Label htmlFor="descriptionEn" className="text-foreground">
                                {t("domains.descriptionEn")}
                            </Label>
                            <Textarea
                                id="descriptionEn"
                                value={form.descriptionEn ?? ""}
                                onChange={(e) => update("descriptionEn", e.target.value)}
                                className="bg-secondary border-0 min-h-[72px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descriptionAr" className="text-foreground">
                                {t("domains.descriptionAr")}
                            </Label>
                            <Textarea
                                id="descriptionAr"
                                dir="rtl"
                                value={form.descriptionAr ?? ""}
                                onChange={(e) => update("descriptionAr", e.target.value)}
                                className="bg-secondary border-0 min-h-[72px]"
                            />
                        </div>

                        {/* Sort order */}
                        <div className="space-y-2">
                            <Label htmlFor="sortOrder" className="text-foreground">
                                {t("treq.sortOrder")}
                            </Label>
                            <Input
                                id="sortOrder"
                                type="number"
                                value={form.sortOrder}
                                onChange={(e) => update("sortOrder", Number(e.target.value))}
                                className="bg-secondary border-0"
                            />
                        </div>

                        {/* File-only options */}
                        {isFile && (
                            <div className="space-y-5 rounded-lg border border-border p-4">
                                <p className="text-sm font-medium text-foreground">{t("treq.fileOptions")}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="minCount" className="text-foreground">
                                            {t("treq.minCount")}
                                        </Label>
                                        <Input
                                            id="minCount"
                                            type="number"
                                            value={form.minCount ?? 0}
                                            onChange={(e) => update("minCount", Number(e.target.value))}
                                            className="bg-secondary border-0"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maxCount" className="text-foreground">
                                            {t("treq.maxCount")}
                                        </Label>
                                        <Input
                                            id="maxCount"
                                            type="number"
                                            value={form.maxCount ?? 0}
                                            onChange={(e) => update("maxCount", Number(e.target.value))}
                                            className="bg-secondary border-0"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxFileSize" className="text-foreground">
                                        {t("treq.maxFileSize")}
                                    </Label>
                                    <Input
                                        id="maxFileSize"
                                        type="number"
                                        min={0}
                                        step="0.5"
                                        value={
                                            form.maxFileSizeBytes != null
                                                ? +(form.maxFileSizeBytes / BYTES_IN_MB).toFixed(2)
                                                : ""
                                        }
                                        onChange={(e) =>
                                            update(
                                                "maxFileSizeBytes",
                                                e.target.value === ""
                                                    ? null
                                                    : Math.round(Number(e.target.value) * BYTES_IN_MB)
                                            )
                                        }
                                        className="bg-secondary border-0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="extensions" className="text-foreground">
                                        {t("treq.allowedExtensions")}
                                    </Label>
                                    <Input
                                        id="extensions"
                                        dir="ltr"
                                        value={extensionsText}
                                        placeholder=".pdf, .jpg, .png"
                                        onChange={(e) => {
                                            setExtensionsText(e.target.value)
                                            const parsed = e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean)
                                            update("allowedExtensions", parsed.length ? parsed : null)
                                        }}
                                        className="bg-secondary border-0"
                                    />
                                    <p className="text-xs text-muted-foreground">{t("treq.allowedExtensionsHint")}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">{t("treq.mapsToDocumentType")}</Label>
                                    <Select
                                        value={form.mapsToDocumentType ? String(form.mapsToDocumentType) : ""}
                                        onValueChange={(value) =>
                                            update("mapsToDocumentType", Number(value) as MapsToDocumentType)
                                        }
                                    >
                                        <SelectTrigger className="bg-secondary border-0">
                                            <SelectValue placeholder={t("treq.mapsToDocumentType")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">{t("treq.docIdentity")}</SelectItem>
                                            <SelectItem value="2">{t("treq.docCertificate")}</SelectItem>
                                            <SelectItem value="3">{t("treq.docOther")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Text-only options */}
                        {isText && (
                            <div className="space-y-2 rounded-lg border border-border p-4">
                                <Label htmlFor="maxLength" className="text-foreground">
                                    {t("treq.maxLength")}
                                </Label>
                                <Input
                                    id="maxLength"
                                    type="number"
                                    min={0}
                                    value={form.maxLength ?? ""}
                                    onChange={(e) =>
                                        update("maxLength", e.target.value === "" ? null : Number(e.target.value))
                                    }
                                    className="bg-secondary border-0"
                                />
                            </div>
                        )}

                        {/* Flags */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
                                <div>
                                    <Label className="text-foreground">{t("treq.required")}</Label>
                                    <p className="text-xs text-muted-foreground">{t("treq.requiredHint")}</p>
                                </div>
                                <Switch
                                    checked={form.isRequired}
                                    onCheckedChange={(checked) => update("isRequired", checked)}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
                                <div>
                                    <Label className="text-foreground">{t("treq.active")}</Label>
                                    <p className="text-xs text-muted-foreground">{t("treq.activeHint")}</p>
                                </div>
                                <Switch
                                    checked={form.isActive}
                                    onCheckedChange={(checked) => update("isActive", checked)}
                                />
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter className="border-t border-border">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground"
                    >
                        {isSubmitting ? (
                            <IconLoader2 className="me-2 h-4 w-4 animate-spin" />
                        ) : (
                            <IconDeviceFloppy className="me-2 h-4 w-4" />
                        )}
                        {isEdit ? t("common.save") : t("common.add")}
                    </Button>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-border">
                        {t("common.cancel")}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
