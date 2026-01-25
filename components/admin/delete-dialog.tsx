"use client"

import * as React from "react"
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
import { IconLoader2, IconAlertTriangle } from "@tabler/icons-react"
import { useLocale } from "@/lib/locale-context"

interface DeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
    itemName?: string
    onConfirm: () => Promise<void>
}

export function DeleteDialog({
    open,
    onOpenChange,
    title,
    description,
    itemName,
    onConfirm,
}: DeleteDialogProps) {
    const { t } = useLocale()
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleConfirm = async () => {
        setIsDeleting(true)
        try {
            await onConfirm()
            onOpenChange(false)
        } catch (error) {
            console.error("Delete error:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const defaultDescription = itemName
        ? `${t("domains.deleteConfirm")} "${itemName}"`
        : t("domains.deleteConfirm")

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <IconAlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <AlertDialogTitle className="text-foreground">
                            {title || t("common.delete")}
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-muted-foreground pt-2">
                        {description || defaultDescription}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="bg-secondary border-0 text-foreground hover:bg-secondary/80"
                    >
                        {t("common.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleConfirm()
                        }}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        {isDeleting && <IconLoader2 className="me-2 h-4 w-4 animate-spin" />}
                        {t("common.delete")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
