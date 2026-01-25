
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { IconArrowLeft, IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react"

interface SelectOption {
    value: string
    label: string
}

interface FieldConfig {
    key: string
    label: string
    labelAr?: string
    type: "text" | "textarea" | "number" | "select" | "switch"
    placeholder?: string
    placeholderAr?: string
    options?: SelectOption[]
    required?: boolean
    section?: "main" | "arabic" | "settings"
}

interface EntityFormProps {
    title: string
    description?: string
    fields: FieldConfig[]
    initialData?: Record<string, any>
    onSubmit: (data: Record<string, any>) => Promise<void>
    onCancel?: () => void
    submitLabel?: string
    isEdit?: boolean
}

export function EntityForm({
    title,
    description,
    fields,
    initialData = {},
    onSubmit,
    onCancel,
    submitLabel = "Save",
    isEdit = false,
}: EntityFormProps) {
    const router = useRouter()
    const [formData, setFormData] = React.useState<Record<string, any>>(initialData)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [errors, setErrors] = React.useState<Record<string, string>>({})

    const handleChange = (key: string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
        if (errors[key]) {
            setErrors((prev) => {
                const newErrors = { ...prev }
                delete newErrors[key]
                return newErrors
            })
        }
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}
        fields.forEach((field) => {
            if (field.required && !formData[field.key]) {
                newErrors[field.key] = `${field.label} is required`
            }
        })
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setIsSubmitting(true)
        try {
            await onSubmit(formData)
        } catch (error) {
            console.error("Form submission error:", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        if (onCancel) {
            onCancel()
        } else {
            router.back()
        }
    }

    const mainFields = fields.filter((f) => f.section !== "arabic" && f.section !== "settings")
    const arabicFields = fields.filter((f) => f.section === "arabic")
    const settingsFields = fields.filter((f) => f.section === "settings")

    const renderField = (field: FieldConfig) => {
        switch (field.type) {
            case "textarea":
                return (
                    <Textarea
                        id={field.key}
                        placeholder={field.placeholder}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="bg-secondary border-0 min-h-[100px]"
                    />
                )
            case "number":
                return (
                    <Input
                        id={field.key}
                        type="number"
                        placeholder={field.placeholder}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="bg-secondary border-0"
                    />
                )
            case "select":
                return (
                    <Select
                        value={formData[field.key] || ""}
                        onValueChange={(value) => handleChange(field.key, value)}
                    >
                        <SelectTrigger className="bg-secondary border-0">
                            <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )
            case "switch":
                return (
                    <Switch
                        id={field.key}
                        checked={formData[field.key] || false}
                        onCheckedChange={(checked) => handleChange(field.key, checked)}
                    />
                )
            default:
                return (
                    <Input
                        id={field.key}
                        placeholder={field.placeholder}
                        value={formData[field.key] || ""}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                        className="bg-secondary border-0"
                    />
                )
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        className="h-9 w-9"
                    >
                        <IconArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                        {description && (
                            <p className="text-muted-foreground">{description}</p>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="bg-transparent border-border"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground"
                    >
                        {isSubmitting ? (
                            <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <IconDeviceFloppy className="mr-2 h-4 w-4" />
                        )}
                        {submitLabel}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Main Information */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">English Content</CardTitle>
                        <CardDescription>Enter the information in English</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mainFields.map((field) => (
                            <div key={field.key} className="space-y-2">
                                <Label htmlFor={field.key} className="text-foreground">
                                    {field.label}
                                    {field.required && <span className="text-destructive ml-1">*</span>}
                                </Label>
                                {renderField(field)}
                                {errors[field.key] && (
                                    <p className="text-sm text-destructive">{errors[field.key]}</p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Arabic Content */}
                {arabicFields.length > 0 && (
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-foreground text-lg">Arabic Content</CardTitle>
                            <CardDescription>Enter the information in Arabic</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4" dir="rtl">
                            {arabicFields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label htmlFor={field.key} className="text-foreground">
                                        {field.labelAr || field.label}
                                        {field.required && <span className="text-destructive ml-1">*</span>}
                                    </Label>
                                    {renderField(field)}
                                    {errors[field.key] && (
                                        <p className="text-sm text-destructive">{errors[field.key]}</p>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Settings */}
            {settingsFields.length > 0 && (
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-foreground text-lg">Settings</CardTitle>
                        <CardDescription>Configure additional options</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {settingsFields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                    {field.type === "switch" ? (
                                        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
                                            <Label htmlFor={field.key} className="text-foreground">
                                                {field.label}
                                            </Label>
                                            {renderField(field)}
                                        </div>
                                    ) : (
                                        <>
                                            <Label htmlFor={field.key} className="text-foreground">
                                                {field.label}
                                                {field.required && <span className="text-destructive ml-1">*</span>}
                                            </Label>
                                            {renderField(field)}
                                            {errors[field.key] && (
                                                <p className="text-sm text-destructive">{errors[field.key]}</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </form>
    )
}
