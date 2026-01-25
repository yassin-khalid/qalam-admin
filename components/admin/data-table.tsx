"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    IconArrowsSort,
    IconChevronDown,
    IconDots,
    IconSearch,
    IconPlus
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "@/lib/locale-context"

interface FilterOption {
    value: string
    label: string
}

interface FilterConfig {
    key: string
    label: string
    options: FilterOption[]
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    title?: string
    searchKey?: string
    searchPlaceholder?: string
    filters?: FilterConfig[]
    onAdd?: () => void
    addButtonLabel?: string
    isLoading?: boolean
    emptyMessage?: string
}

export function DataTable<TData, TValue>({
    columns,
    data,
    title,
    searchKey = "name",
    searchPlaceholder,
    filters = [],
    onAdd,
    addButtonLabel,
    isLoading = false,
    emptyMessage,
}: DataTableProps<TData, TValue>) {
    const { t } = useLocale()
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <Card className="bg-card border-border">
            {title && (
                <CardHeader className="border-b border-border pb-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-foreground">{title}</CardTitle>
                        {onAdd && (
                            <Button onClick={onAdd} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                <IconPlus className="me-2 h-4 w-4" />
                                {addButtonLabel || t("common.add")}
                            </Button>
                        )}
                    </div>
                </CardHeader>
            )}
            <CardContent className="p-4">
                <div className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-1 items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <IconSearch className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder || t("common.search")}
                                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                }
                                className="ps-9 bg-secondary border-0"
                            />
                        </div>
                        {filters.map((filter) => (
                            <Select
                                key={filter.key}
                                onValueChange={(value) =>
                                    table.getColumn(filter.key)?.setFilterValue(value === "all" ? "" : value)
                                }
                            >
                                <SelectTrigger className="w-[150px] bg-secondary border-0">
                                    <SelectValue placeholder={filter.label} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("common.all")}</SelectItem>
                                    {filter.options.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-transparent border-border">
                                {t("common.filter")} <IconChevronDown className="ms-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead
                                                key={header.id}
                                                className="bg-secondary text-muted-foreground font-medium"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-border">
                                        {columns.map((_, j) => (
                                            <TableCell key={j}>
                                                <Skeleton className="h-6 w-full" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="border-border hover:bg-secondary/50"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="text-foreground">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center text-muted-foreground"
                                    >
                                        {emptyMessage || t("common.noData")}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                        {t("common.showing")} {table.getFilteredRowModel().rows.length} {t("common.results")}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="bg-transparent border-border"
                        >
                            {t("common.previous")}
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            {table.getState().pagination.pageIndex + 1} {t("common.of")}{" "}
                            {table.getPageCount()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="bg-transparent border-border"
                        >
                            {t("common.next")}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Reusable column helpers
export function StatusCell({ active }: { active: boolean }) {
    const { t } = useLocale()

    return (
        <Badge
            variant="outline"
            className={
                active
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-muted text-muted-foreground border-border"
            }
        >
            {active ? t("common.active") : t("common.inactive")}
        </Badge>
    )
}

export function ActionsCell({
    onView,
    onEdit,
    onDelete,
    onToggleStatus,
    isActive,
}: {
    onView?: () => void
    onEdit?: () => void
    onDelete?: () => void
    onToggleStatus?: () => void
    isActive?: boolean
}) {
    const { t } = useLocale()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">{t("common.actions")}</span>
                    <IconDots className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                {onView && (
                    <DropdownMenuItem onClick={onView}>{t("common.view")}</DropdownMenuItem>
                )}
                {onEdit && <DropdownMenuItem onClick={onEdit}>{t("common.edit")}</DropdownMenuItem>}
                {onToggleStatus && (
                    <DropdownMenuItem onClick={onToggleStatus}>
                        {isActive ? t("common.inactive") : t("common.active")}
                    </DropdownMenuItem>
                )}
                {onDelete && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={onDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            {t("common.delete")}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function SortableHeader({
    column,
    title,
}: {
    column: any
    title: string
}) {
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ms-4 hover:bg-transparent"
        >
            {title}
            <IconArrowsSort className="ms-2 h-4 w-4" />
        </Button>
    )
}
