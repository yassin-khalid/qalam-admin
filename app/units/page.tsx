
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    IconPlus,
    IconSearch,
    IconRefresh,
    IconAlertCircle,
    IconChevronLeft,
    IconChevronRight,
} from "@tabler/icons-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatusCell } from "@/components/admin/data-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useLiveQuery } from "@tanstack/react-db"
import { subjectCollection } from "@/collections/subjects"
import { UnitItem, UnitTypeCode } from "@/collections/units"
import { PaginatedResult, PaginationMeta } from "@/types/ApiResponse"
import { useLocale } from "@/lib/locale-context"

// The /Content/Units endpoint accepts server-side filters (CRUD guide §10).
// Casing is tolerant: success responses are camelCase, error responses PascalCase.
interface UnitsResponse {
    succeeded?: boolean
    Succeeded?: boolean
    message?: string
    Message?: string
    data?: PaginatedResult<UnitItem> | UnitItem[] | null
    Data?: PaginatedResult<UnitItem> | UnitItem[] | null
    meta?: PaginationMeta | null
}

const UNIT_TYPES: UnitTypeCode[] = ["SchoolUnit", "QuranSurah", "QuranPart", "LanguageModule"]
const PAGE_SIZE = 10
const ALL = "all"

export default function UnitsPage() {
    const router = useRouter()
    const { locale, direction } = useLocale()

    // Server-side filter state (sent as query params).
    const [subjectId, setSubjectId] = React.useState<string>(ALL)
    const [unitTypeCode, setUnitTypeCode] = React.useState<string>(ALL)
    const [search, setSearch] = React.useState("")
    const [pageNumber, setPageNumber] = React.useState(1)

    const [rows, setRows] = React.useState<UnitItem[]>([])
    const [meta, setMeta] = React.useState<PaginationMeta | null>(null)
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Subjects power both the filter dropdown and the subject-name lookup.
    const { data: subjects } = useLiveQuery(q => q.from({ subjects: subjectCollection }))
    const subjectName = React.useCallback((id: number) => {
        const s = (subjects ?? []).find(x => x.id === id)
        return s ? (locale === "ar" ? s.nameAr : s.nameEn) : ""
    }, [subjects, locale])

    const fetchUnits = React.useCallback(async () => {
        setLoading(true)
        setError(null)
        const sp = new URLSearchParams()
        sp.set("pageNumber", String(pageNumber))
        sp.set("pageSize", String(PAGE_SIZE))
        if (subjectId !== ALL) sp.set("subjectId", subjectId)
        if (unitTypeCode !== ALL) sp.set("unitTypeCode", unitTypeCode)
        if (search.trim()) sp.set("search", search.trim())
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Content/Units?${sp.toString()}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
                    "Accept-Language": locale === "en" ? "en-US" : "ar-EG",
                },
            })
            const json: UnitsResponse = await res.json().catch(() => ({}))
            const succeeded = json.succeeded ?? json.Succeeded
            const payload = json.data ?? json.Data
            if (!res.ok || succeeded === false || payload == null) {
                setRows([])
                setMeta(null)
                setError(json.message ?? json.Message ?? `Request failed (HTTP ${res.status})`)
                return
            }
            setRows(Array.isArray(payload) ? payload : payload.items ?? [])
            setMeta(json.meta ?? (Array.isArray(payload) ? null : payload))
        } catch (e) {
            setRows([])
            setMeta(null)
            setError(e instanceof Error ? e.message : "Failed to fetch units")
        } finally {
            setLoading(false)
        }
    }, [subjectId, unitTypeCode, search, pageNumber, locale])

    // Debounced fetch whenever a filter changes (covers typing in search too).
    React.useEffect(() => {
        const t = setTimeout(() => { fetchUnits() }, 350)
        return () => clearTimeout(t)
    }, [fetchUnits])

    // Reset to page 1 when a non-page filter changes.
    React.useEffect(() => { setPageNumber(1) }, [subjectId, unitTypeCode, search])

    const totalPages = meta?.totalPages ?? 1
    const totalCount = meta?.totalCount ?? rows.length

    return (
        <AdminLayout
            breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Units" },
            ]}
        >
            <Card className="bg-card border-border" dir={direction}>
                <CardHeader className="border-b border-border pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-foreground">Units</CardTitle>
                        <Button onClick={() => router.push("/units/new")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <IconPlus className="me-2 h-4 w-4" />
                            Add Unit
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                    {/* Server-side filters (sent to /Content/Units) */}
                    <div className="grid gap-3 md:grid-cols-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <Label className="text-xs text-muted-foreground">Search</Label>
                            <div className="relative">
                                <IconSearch className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search units by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="ps-9 bg-secondary border-0"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Subject</Label>
                            <Select value={subjectId} onValueChange={(v) => setSubjectId(v ?? ALL)}>
                                <SelectTrigger className="w-full bg-secondary border-0">
                                    <SelectValue placeholder="All subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All subjects</SelectItem>
                                    {(subjects ?? []).map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {locale === "ar" ? s.nameAr : s.nameEn}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Unit Type</Label>
                            <Select value={unitTypeCode} onValueChange={(v) => setUnitTypeCode(v ?? ALL)}>
                                <SelectTrigger className="w-full bg-secondary border-0">
                                    <SelectValue placeholder="All types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All types</SelectItem>
                                    {UNIT_TYPES.map(tc => (
                                        <SelectItem key={tc} value={tc}>{tc}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">
                            {loading ? "Loading..." : `Showing ${rows.length} of ${totalCount} result${totalCount === 1 ? "" : "s"}`}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => fetchUnits()} disabled={loading} className="gap-2">
                            <IconRefresh className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                            Refresh
                        </Button>
                    </div>

                    {/* Server error (e.g. the 500 object-cycle) surfaced instead of a silent empty table */}
                    {error && (
                        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
                            <IconAlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                            <div>
                                <p className="font-medium text-destructive">Failed to load units</p>
                                <p className="text-muted-foreground wrap-break-word">{error}</p>
                            </div>
                        </div>
                    )}

                    <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="bg-secondary text-muted-foreground font-medium">Order</TableHead>
                                    <TableHead className="bg-secondary text-muted-foreground font-medium">Name (EN)</TableHead>
                                    <TableHead className="bg-secondary text-muted-foreground font-medium">Name (AR)</TableHead>
                                    <TableHead className="bg-secondary text-muted-foreground font-medium">Subject</TableHead>
                                    <TableHead className="bg-secondary text-muted-foreground font-medium">Type</TableHead>
                                    <TableHead className="bg-secondary text-muted-foreground font-medium">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <TableRow key={i} className="border-border">
                                            {[1, 2, 3, 4, 5, 6].map(j => (
                                                <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : rows.length === 0 ? (
                                    <TableRow className="border-border hover:bg-transparent">
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No data available
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rows.map(u => (
                                        <TableRow key={u.id} className="border-border">
                                            <TableCell>
                                                <div className="flex h-8 w-8 items-center justify-center rounded bg-secondary text-sm font-medium text-foreground">
                                                    {u.orderIndex}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-foreground">{u.nameEn}</TableCell>
                                            <TableCell dir="rtl" className="text-foreground">{u.nameAr}</TableCell>
                                            <TableCell>
                                                {subjectName(u.subjectId)
                                                    ? <Badge variant="outline" className="bg-chart-5/10 text-chart-5 border-chart-5/20">{subjectName(u.subjectId)}</Badge>
                                                    : <span className="text-muted-foreground">—</span>}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{u.unitTypeCode}</TableCell>
                                            <TableCell><StatusCell active={u.isActive} /></TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Server-side pagination */}
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-muted-foreground">
                            Page {meta?.pageNumber ?? pageNumber} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                disabled={loading || (meta ? !meta.hasPreviousPage : pageNumber <= 1)}
                                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                            >
                                <IconChevronLeft className="h-4 w-4 rtl:rotate-180" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                disabled={loading || (meta ? !meta.hasNextPage : pageNumber >= totalPages)}
                                onClick={() => setPageNumber(p => p + 1)}
                            >
                                Next
                                <IconChevronRight className="h-4 w-4 rtl:rotate-180" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    )
}
