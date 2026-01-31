"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    IconChevronRight,
    IconChevronLeft,
    IconWorld,
    IconBook2,
    IconSchool,
    IconStack,
    IconFolder,
    IconBookmark,
    IconFileText,
    IconCalendar,
    IconRefresh
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale-context"
import { ApiResponse } from "@/types/ApiResponse"
import { EducationDomainItem } from "@/collections/domain"

// API Response Types
interface CurrentState {
    domainId: number | null
    curriculumId: number | null
    levelId: number | null
    gradeId: number | null
    termId: number | null
    subjectId: number | null
    quranContentTypeId: number | null
    quranLevelId: number | null
    unitTypeCode?: string | null
}

interface Rule {
    hasCurriculum: boolean
    hasEducationLevel: boolean
    hasGrade: boolean
    hasAcademicTerm: boolean
    hasContentUnits: boolean
    hasLessons: boolean
    requiresQuranContentType: boolean
    requiresQuranLevel: boolean
    requiresUnitTypeSelection?: boolean
}

interface Option {
    id: number
    nameAr: string
    nameEn: string
    code: string | null
}

// Quran-specific types
interface QuranContentType {
    id: number
    nameAr: string
    nameEn: string
    code: string
}

interface QuranLevel {
    id: number
    nameAr: string
    nameEn: string
    code: string | null
}

interface QuranSubject {
    id: number
    nameAr: string
    nameEn: string
    code: string | null
}

interface HierarchyData {
    currentState: CurrentState
    rule: Rule
    nextStep: string
    options: Option[]
    // Quran-specific fields
    unit?: Option[]
    contentTypes?: QuranContentType[]
    levels?: QuranLevel[]
    subject?: QuranSubject
    totalCount?: number
    pageNumber?: number
    pageSize?: number
    totalPages?: number
}

// interface ApiResponse {
//     statusCode: number
//     succeeded: boolean
//     message: string
//     data: HierarchyData
//     errors: null | string[]
//     meta: null | Record<string, unknown>
// }

type StepType = "Domain" | "Curriculum" | "Level" | "Grade" | "Term" | "Subject" | "Unit" | "Lesson"

const stepIcons: Record<string, React.ElementType> = {
    Domain: IconWorld,
    Curriculum: IconBook2,
    Level: IconSchool,
    Grade: IconStack,
    Term: IconCalendar,
    Subject: IconFolder,
    Unit: IconBookmark,
    Lesson: IconFileText,
}

const stepColors: Record<string, string> = {
    Domain: "text-chart-1",
    Curriculum: "text-chart-2",
    Level: "text-chart-3",
    Grade: "text-chart-4",
    Term: "text-chart-5",
    Subject: "text-chart-1",
    Unit: "text-chart-2",
    Lesson: "text-chart-3",
}

interface BreadcrumbItem {
    step: StepType
    id: number
    nameEn: string
    nameAr: string
}

// // Domain from Domains API
// interface Domain {
//     id: number
//     nameAr: string
//     nameEn: string
//     code: string | null
//     descriptionAr?: string
//     descriptionEn?: string
//     createdAt?: string
// }

// // Domains API Response (paginated)
// interface DomainsApiResponse {
//     statusCode: number
//     succeeded: boolean
//     message: string
//     data: {
//         items: Domain[]
//         totalCount: number
//         pageNumber: number
//         pageSize: number
//         totalPages: number
//         hasPreviousPage: boolean
//         hasNextPage: boolean
//     }
//     errors: null | string[]
//     meta: null | Record<string, unknown>
// }

// UnitTypeCode options for Quran domain
type UnitTypeCode = "QuranSurah" | "QuranPart"

// Filter API params - DomainId is required
interface FilterParams {
    DomainId: number
    CurriculumId?: number
    LevelId?: number
    GradeId?: number
    TermId?: number
    SubjectId?: number
    UnitTypeCode?: UnitTypeCode // Required for Quran domain
}

// Build query string from params - accumulative (DomainId is always required)
function buildFilterQueryString(params: FilterParams): string {
    const searchParams = new URLSearchParams()

    // DomainId is required
    searchParams.set("DomainId", params.DomainId.toString())

    // Optional accumulative params
    if (params.CurriculumId) searchParams.set("CurriculumId", params.CurriculumId.toString())
    if (params.LevelId) searchParams.set("LevelId", params.LevelId.toString())
    if (params.GradeId) searchParams.set("GradeId", params.GradeId.toString())
    if (params.TermId) searchParams.set("TermId", params.TermId.toString())
    if (params.SubjectId) searchParams.set("SubjectId", params.SubjectId.toString())
    if (params.UnitTypeCode) searchParams.set("UnitTypeCode", params.UnitTypeCode)

    return `?${searchParams.toString()}`
}

// API function to fetch all domains (separate endpoint)
async function fetchDomains(): Promise<ApiResponse<EducationDomainItem[]>> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Domains`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
    const data: ApiResponse<EducationDomainItem[]> = await response.json()
    return data
}

// API function to fetch filter/hierarchy data (requires DomainId)
async function fetchFilter(params: FilterParams): Promise<ApiResponse<HierarchyData>> {
    const queryString = buildFilterQueryString(params)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/filter-options${queryString}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
    const data: ApiResponse<HierarchyData> = await response.json()
    return data
}

function OptionItem({
    option,
    step,
    onSelect,
    isSelected
}: {
    option: Option
    step: string
    onSelect: () => void
    isSelected: boolean
}) {
    const { locale } = useLocale()
    const Icon = stepIcons[step] || IconWorld
    const colorClass = stepColors[step] || "text-primary"

    return (
        <button
            onClick={onSelect}
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors",
                isSelected
                    ? "bg-primary/10 border border-primary/30"
                    : "hover:bg-secondary border border-transparent"
            )}
        >
            <div className={cn("p-1.5 rounded-md", isSelected ? "bg-primary/20" : "bg-muted")}>
                <Icon className={cn("h-4 w-4", isSelected ? "text-primary" : colorClass)} />
            </div>
            <span className={cn("truncate", isSelected ? "text-primary font-medium" : "text-foreground")}>
                {locale === "ar" ? option.nameAr : option.nameEn}
            </span>
            {isSelected && (
                <Badge variant="secondary" className="ms-auto text-xs bg-primary/10 text-primary border-0">
                    {locale === "ar" ? "محدد" : "Selected"}
                </Badge>
            )}
        </button>
    )
}

function BreadcrumbNav({
    items,
    onNavigate,
    onReset
}: {
    items: BreadcrumbItem[]
    onNavigate: (index: number) => void
    onReset: () => void
}) {
    const { locale, direction, t } = useLocale()
    const ChevronIcon = direction === "rtl" ? IconChevronLeft : IconChevronRight

    if (items.length === 0) return null

    return (
        <div className="flex flex-wrap items-center gap-1 px-1 pb-3 text-sm border-b border-border mb-3">
            <button
                onClick={onReset}
                className="text-muted-foreground hover:text-foreground transition-colors"
            >
                {t("dashboard.contentHierarchy")}
            </button>
            {items.map((item, index) => {
                const Icon = stepIcons[item.step]
                return (
                    <React.Fragment key={`${item.step}-${item.id}`}>
                        <ChevronIcon className="h-3 w-3 text-muted-foreground" />
                        <button
                            onClick={() => onNavigate(index)}
                            className={cn(
                                "flex items-center gap-1 transition-colors",
                                index === items.length - 1
                                    ? "text-primary font-medium"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className="h-3 w-3" />
                            <span className="max-w-[100px] truncate">
                                {locale === "ar" ? item.nameAr : item.nameEn}
                            </span>
                        </button>
                    </React.Fragment>
                )
            })}
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-4 flex-1" />
                </div>
            ))}
        </div>
    )
}

// interface HierarchyParams extends FilterParams { }

export function HierarchyTree() {
    const { t, locale } = useLocale()
    const [isLoading, setIsLoading] = React.useState(true)
    const [domains, setDomains] = React.useState<EducationDomainItem[]>([])
    const [filterData, setFilterData] = React.useState<HierarchyData | null>(null)
    const [breadcrumb, setBreadcrumb] = React.useState<BreadcrumbItem[]>([])
    const [selectedId, setSelectedId] = React.useState<number | null>(null)
    const [currentStep, setCurrentStep] = React.useState<"domains" | "unitTypeSelection" | "filter">("domains")
    const [selectedDomain, setSelectedDomain] = React.useState<EducationDomainItem | null>(null)
    const [selectedUnitTypeCode, setSelectedUnitTypeCode] = React.useState<UnitTypeCode | null>(null)

    // Check if selected domain is Quran
    const isQuranDomain = selectedDomain?.code === "quran"

    // Load domains from Domains API (initial load)
    const loadDomains = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetchDomains()
            if (response.succeeded) {
                setDomains(response.data.items)
                setCurrentStep("domains")
                setFilterData(null)
                setSelectedId(null)
                setSelectedDomain(null)
                setSelectedUnitTypeCode(null)
            }
        } catch (error) {
            console.error("Failed to load domains:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Load filter data from Filter API (requires DomainId, and UnitTypeCode for Quran)
    const loadFilter = React.useCallback(async (params: FilterParams) => {
        setIsLoading(true)
        try {
            const response = await fetchFilter(params)
            if (response.succeeded) {
                setFilterData(response.data)
                setCurrentStep("filter")
                setSelectedId(null)
            }
        } catch (error) {
            console.error("Failed to load filter:", error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Initial load - fetch domains
    React.useEffect(() => {
        loadDomains()
    }, [loadDomains])

    // Build FilterParams from breadcrumb items - accumulative (DomainId required)
    const buildFilterParams = (items: BreadcrumbItem[]): FilterParams | null => {
        const domainItem = items.find(item => item.step === "Domain")
        if (!domainItem) return null

        const params: FilterParams = { DomainId: domainItem.id }

        // Add UnitTypeCode if Quran domain
        if (selectedUnitTypeCode && selectedDomain?.code === "quran") {
            params.UnitTypeCode = selectedUnitTypeCode
        }

        for (const item of items) {
            switch (item.step) {
                case "Curriculum":
                    params.CurriculumId = item.id
                    break
                case "Level":
                    params.LevelId = item.id
                    break
                case "Grade":
                    params.GradeId = item.id
                    break
                case "Term":
                    params.TermId = item.id
                    break
                case "Subject":
                    params.SubjectId = item.id
                    break
            }
        }

        return params
    }

    // Handle domain selection (first step)
    const handleSelectDomain = (domain: EducationDomainItem) => {
        const newBreadcrumbItem: BreadcrumbItem = {
            step: "Domain",
            id: domain.id,
            nameEn: domain.nameEn,
            nameAr: domain.nameAr,
        }

        const newBreadcrumb = [newBreadcrumbItem]
        setBreadcrumb(newBreadcrumb)
        setSelectedDomain(domain)

        // If Quran domain, show UnitTypeCode selection first
        if (domain.code === "quran") {
            setCurrentStep("unitTypeSelection")
            setIsLoading(false)
        } else {
            // Call filter API with DomainId for non-Quran domains
            loadFilter({ DomainId: domain.id })
        }
    }

    // Handle UnitTypeCode selection (for Quran domain only)
    const handleSelectUnitType = (unitTypeCode: UnitTypeCode) => {
        if (!selectedDomain) return

        setSelectedUnitTypeCode(unitTypeCode)

        // Call filter API with DomainId and UnitTypeCode
        loadFilter({ DomainId: selectedDomain.id, UnitTypeCode: unitTypeCode })
    }

    // Handle filter option selection (subsequent steps)
    const handleSelectOption = (option: Option) => {
        if (!filterData) return

        // For Quran domain with units - this is the final level, just select the item
        // Don't add to breadcrumb or call API again
        if (isQuranDomain && filterData.nextStep === "Unit") {
            setSelectedId(option.id)
            return
        }

        const newBreadcrumbItem: BreadcrumbItem = {
            step: filterData.nextStep as StepType,
            id: option.id,
            nameEn: option.nameEn,
            nameAr: option.nameAr,
        }

        const newBreadcrumb = [...breadcrumb, newBreadcrumbItem]
        setBreadcrumb(newBreadcrumb)

        // Build accumulative params from breadcrumb
        const params = buildFilterParams(newBreadcrumb)
        if (params) {
            loadFilter(params)
        }
    }

    const handleNavigate = (index: number) => {
        const newBreadcrumb = breadcrumb.slice(0, index + 1)
        setBreadcrumb(newBreadcrumb)

        // If navigating back to domain level, reload filter with just DomainId
        const params = buildFilterParams(newBreadcrumb)
        if (params) {
            loadFilter(params)
        }
    }

    const handleReset = () => {
        setBreadcrumb([])
        setFilterData(null)
        setSelectedDomain(null)
        setSelectedUnitTypeCode(null)
        loadDomains()
    }

    // Get current step label
    const getCurrentStepLabel = () => {
        if (currentStep === "domains") {
            return locale === "ar" ? "النطاقات" : "Domains"
        }
        if (currentStep === "unitTypeSelection") {
            return locale === "ar" ? "نوع المحتوى" : "Content Type"
        }
        if (filterData?.nextStep) {
            const labels = locale === "ar" ? {
                Domain: "النطاقات",
                Curriculum: "المناهج",
                Level: "المراحل",
                Grade: "الصفوف",
                Term: "الفصول",
                Subject: "المواد",
                Unit: "الوحدات",
                Lesson: "الدروس",
            } : {
                Domain: "Domains",
                Curriculum: "Curriculums",
                Level: "Levels",
                Grade: "Grades",
                Term: "Terms",
                Subject: "Subjects",
                Unit: "Units",
                Lesson: "Lessons",
            }
            return labels[filterData.nextStep as keyof typeof labels] || ""
        }
        return ""
    }

    const currentStepLabel = getCurrentStepLabel()

    // UnitType options for Quran domain
    const unitTypeOptions: { code: UnitTypeCode; nameAr: string; nameEn: string; icon: React.ElementType }[] = [
        { code: "QuranSurah", nameAr: "السور", nameEn: "Surahs", icon: IconBook2 },
        { code: "QuranPart", nameAr: "الأجزاء", nameEn: "Juz (Parts)", icon: IconBookmark },
    ]

    // Determine what to show in the list
    const renderOptions = () => {
        if (isLoading) {
            return <LoadingSkeleton />
        }

        // Show domains list
        if (currentStep === "domains" && domains.length > 0) {
            return (
                <div className="space-y-1.5">
                    {domains.map((domain) => (
                        <OptionItem
                            key={domain.id}
                            option={domain}
                            step="Domain"
                            onSelect={() => handleSelectDomain(domain)}
                            isSelected={selectedId === domain.id}
                        />
                    ))}
                </div>
            )
        }

        // Show UnitTypeCode selection for Quran domain
        if (currentStep === "unitTypeSelection") {
            return (
                <div className="space-y-1.5">
                    {unitTypeOptions.map((unitType) => {
                        const Icon = unitType.icon
                        return (
                            <button
                                key={unitType.code}
                                onClick={() => handleSelectUnitType(unitType.code)}
                                className={cn(
                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition-colors",
                                    "hover:bg-secondary border border-transparent"
                                )}
                            >
                                <div className="p-1.5 rounded-md bg-muted">
                                    <Icon className="h-4 w-4 text-chart-1" />
                                </div>
                                <span className="truncate text-foreground">
                                    {locale === "ar" ? unitType.nameAr : unitType.nameEn}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )
        }

        // Show filter options (including Quran units)
        if (currentStep === "filter") {
            // For Quran domain with units, show the unit array
            if (filterData?.unit && filterData.unit.length > 0) {
                return (
                    <div className="space-y-1.5">
                        {filterData.unit.map((unit) => (
                            <OptionItem
                                key={unit.id}
                                option={unit}
                                step="Unit"
                                onSelect={() => handleSelectOption(unit)}
                                isSelected={selectedId === unit.id}
                            />
                        ))}
                    </div>
                )
            }

            // Regular options
            if (filterData?.options && filterData.options.length > 0) {
                return (
                    <div className="space-y-1.5">
                        {filterData.options.map((option) => (
                            <OptionItem
                                key={option.id}
                                option={option}
                                step={filterData.nextStep}
                                onSelect={() => handleSelectOption(option)}
                                isSelected={selectedId === option.id}
                            />
                        ))}
                    </div>
                )
            }
        }

        // Empty state
        return (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <IconFileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                    {locale === "ar" ? "لا يوجد المزيد من العناصر" : "No more items available"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {locale === "ar" ? "تم الوصول إلى نهاية التسلسل الهرمي" : "End of hierarchy reached"}
                </p>
            </div>
        )
    }

    return (
        <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                    <CardTitle className="text-foreground">{t("dashboard.contentHierarchy")}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {currentStepLabel}
                    </Badge>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleReset}
                    disabled={isLoading}
                >
                    <IconRefresh className={cn("h-4 w-4", isLoading && "animate-spin")} />
                </Button>
            </CardHeader>
            <CardContent className="pt-0">
                <BreadcrumbNav
                    items={breadcrumb}
                    onNavigate={handleNavigate}
                    onReset={handleReset}
                />
                <ScrollArea className="h-[350px]">
                    {renderOptions()}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
