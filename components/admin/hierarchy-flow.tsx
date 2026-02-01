
"use client"

import * as React from "react"
import {
    ReactFlow,
    Node,
    Edge,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Position,
    MarkerType,
    BackgroundVariant,
    ConnectionLineType,
    BaseEdge,
    EdgeProps,
    getSmoothStepPath,
    getBezierPath,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
    IconWorld,
    IconBook,
    IconSchool,
    IconStack,
    IconFolderOpen,
    IconBookmark,
    IconFileText,
    IconCalendar,
    IconRefresh,
    IconChevronRight,
    IconMaximize,
    IconMinimize,
    IconSparkles,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale-context"
import { ApiResponse } from "@/types/ApiResponse"
import { EducationDomainItem } from "@/collections/domain"

// Types
interface Option {
    id: number
    nameAr: string
    nameEn: string
    code: string | null
}

interface Domain {
    id: number
    nameAr: string
    nameEn: string
    code: string | null
}

interface HierarchyData {
    currentState: {
        domainId: number | null
        curriculumId: number | null
        levelId: number | null
        gradeId: number | null
        termId: number | null
        subjectId: number | null
    }
    rule: {
        hasCurriculum: boolean
        hasEducationLevel: boolean
        hasGrade: boolean
        hasAcademicTerm: boolean
    }
    nextStep: string
    options: Option[]
    unit?: Option[]
}

type StepType = "Domain" | "Curriculum" | "Level" | "Grade" | "Term" | "Subject" | "Unit" | "Lesson" | "UnitType"
type UnitTypeCode = "QuranSurah" | "QuranPart"

interface FilterParams {
    DomainId: number
    CurriculumId?: number
    LevelId?: number
    GradeId?: number
    TermId?: number
    SubjectId?: number
    UnitTypeCode?: UnitTypeCode
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

interface BreadcrumbItem {
    step: StepType
    id: number
    nameEn: string
    nameAr: string
}

// Step configuration with vibrant colors
const stepConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; glowColor: string; gradient: string }> = {
    Domain: { icon: IconWorld, color: "text-emerald-400", bgColor: "bg-emerald-500/20", glowColor: "shadow-emerald-500/50", gradient: "from-emerald-500 to-teal-500" },
    Curriculum: { icon: IconBook, color: "text-blue-400", bgColor: "bg-blue-500/20", glowColor: "shadow-blue-500/50", gradient: "from-blue-500 to-cyan-500" },
    Level: { icon: IconSchool, color: "text-amber-400", bgColor: "bg-amber-500/20", glowColor: "shadow-amber-500/50", gradient: "from-amber-500 to-orange-500" },
    Grade: { icon: IconStack, color: "text-purple-400", bgColor: "bg-purple-500/20", glowColor: "shadow-purple-500/50", gradient: "from-purple-500 to-pink-500" },
    Term: { icon: IconCalendar, color: "text-pink-400", bgColor: "bg-pink-500/20", glowColor: "shadow-pink-500/50", gradient: "from-pink-500 to-rose-500" },
    Subject: { icon: IconFolderOpen, color: "text-cyan-400", bgColor: "bg-cyan-500/20", glowColor: "shadow-cyan-500/50", gradient: "from-cyan-500 to-blue-500" },
    Unit: { icon: IconBookmark, color: "text-orange-400", bgColor: "bg-orange-500/20", glowColor: "shadow-orange-500/50", gradient: "from-orange-500 to-red-500" },
    UnitType: { icon: IconSparkles, color: "text-violet-400", bgColor: "bg-violet-500/20", glowColor: "shadow-violet-500/50", gradient: "from-violet-500 to-purple-500" },
    Lesson: { icon: IconFileText, color: "text-lime-400", bgColor: "bg-lime-500/20", glowColor: "shadow-lime-500/50", gradient: "from-lime-500 to-green-500" },
}

// Custom animated gradient edge
function GlowEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
        curvature: 0.4,
    })

    const isActive = data?.isActive as boolean
    const gradientId = `gradient-${id}`

    return (
        <>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isActive ? "#14b8a6" : "#374151"} />
                    <stop offset="50%" stopColor={isActive ? "#06b6d4" : "#4b5563"} />
                    <stop offset="100%" stopColor={isActive ? "#0ea5e9" : "#374151"} />
                </linearGradient>
                {isActive && (
                    <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                )}
            </defs>
            {/* Background glow for active edges */}
            {isActive && (
                <path
                    d={edgePath}
                    fill="none"
                    stroke="url(#gradient-glow)"
                    strokeWidth={8}
                    strokeOpacity={0.3}
                    className="animate-pulse"
                />
            )}
            {/* Main edge */}
            <path
                id={id}
                d={edgePath}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={isActive ? 3 : 2}
                strokeLinecap="round"
                filter={isActive ? `url(#glow-${id})` : undefined}
                className={cn(
                    "transition-all duration-500",
                    isActive && "drop-shadow-lg"
                )}
            />
            {/* Animated dot for active edges */}
            {isActive && (
                <circle r="4" fill="#14b8a6" className="animate-pulse">
                    <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
                </circle>
            )}
            {/* Arrow marker */}
            <circle
                cx={targetX}
                cy={targetY}
                r={isActive ? 5 : 4}
                fill={isActive ? "#14b8a6" : "#4b5563"}
                className="transition-all duration-300"
            />
        </>
    )
}

// Custom Node Component with enhanced styling
function HierarchyNode({ data }: {
    data: {
        label: string
        step: string
        isSelected: boolean
        isActive: boolean
        onClick: () => void
        locale: string
        count?: number
    }
}) {
    const config = stepConfig[data.step] || stepConfig.Domain
    const Icon = config.icon

    return (
        <div
            onClick={data.onClick}
            className={cn(
                "group relative px-5 py-4 rounded-2xl cursor-pointer transition-all duration-300 min-w-[160px] max-w-[200px]",
                "backdrop-blur-sm",
                data.isActive
                    ? `bg-gradient-to-br ${config.gradient} shadow-2xl ${config.glowColor} scale-105`
                    : data.isSelected
                        ? "bg-card/90 border-2 border-primary shadow-xl shadow-primary/30 scale-105"
                        : "bg-card/80 border border-border/50 hover:border-primary/50 hover:shadow-lg hover:scale-[1.02]"
            )}
        >
            {/* Decorative glow ring for active nodes */}
            {data.isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
            )}

            <div className="flex items-center gap-3 relative z-10">
                <div className={cn(
                    "p-2.5 rounded-xl transition-all duration-300",
                    data.isActive
                        ? "bg-white/20 shadow-inner"
                        : config.bgColor
                )}>
                    <Icon className={cn(
                        "h-5 w-5 transition-all duration-300",
                        data.isActive ? "text-white" : config.color
                    )} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-[10px] uppercase tracking-wider font-semibold mb-0.5",
                        data.isActive ? "text-white/70" : "text-muted-foreground"
                    )}>
                        {data.step}
                    </p>
                    <p className={cn(
                        "text-sm font-bold truncate",
                        data.isActive ? "text-white" : "text-foreground"
                    )}>
                        {data.label}
                    </p>
                </div>
            </div>

            {/* Hover effect pulse ring */}
            <div className={cn(
                "absolute inset-0 rounded-2xl transition-all duration-300 opacity-0 group-hover:opacity-100",
                "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
            )} />
        </div>
    )
}

// Node types registration
const nodeTypes = {
    hierarchy: HierarchyNode,
}

// Edge types registration
const edgeTypes = {
    glow: GlowEdge,
}

// Mock API functions (same as before)
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

async function fetchFilter(params: FilterParams): Promise<{ data: HierarchyData }> {
    const queryString = buildFilterQueryString(params)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/filter-options${queryString}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    })
    const data: ApiResponse<HierarchyData> = await response.json()
    if (!data.succeeded)
        throw new Error('Failed to fetch filter data')
    return {
        data: data.data
    }
}

// Loading skeleton with pulse animation
function LoadingSkeleton() {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-6">
                <div className="flex gap-6">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-44 rounded-2xl animate-pulse" />
                    ))}
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-1 w-20 rounded-full" />
                    <Skeleton className="h-1 w-20 rounded-full" />
                </div>
            </div>
        </div>
    )
}

export function HierarchyFlow() {
    const { t, locale, direction } = useLocale()
    const [isLoading, setIsLoading] = React.useState(true)
    const [domains, setDomains] = React.useState<Domain[]>([])
    const [filterData, setFilterData] = React.useState<HierarchyData | null>(null)
    const [breadcrumb, setBreadcrumb] = React.useState<BreadcrumbItem[]>([])
    const [selectedDomain, setSelectedDomain] = React.useState<Domain | null>(null)
    const [selectedUnitTypeCode, setSelectedUnitTypeCode] = React.useState<UnitTypeCode | null>(null)
    const [currentStep, setCurrentStep] = React.useState<"domains" | "unitTypeSelection" | "filter">("domains")
    const [isExpanded, setIsExpanded] = React.useState(false)

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    const isQuranDomain = selectedDomain?.code === "quran"

    // Load domains
    const loadDomains = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetchDomains()
            setDomains(response.data?.items)
            setCurrentStep("domains")
            setFilterData(null)
            setSelectedDomain(null)
            setSelectedUnitTypeCode(null)
            setBreadcrumb([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Load filter data
    const loadFilter = React.useCallback(async (params: FilterParams) => {
        setIsLoading(true)
        try {
            const response = await fetchFilter(params)
            setFilterData(response.data)
            setCurrentStep("filter")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadDomains()
    }, [loadDomains])

    // Build filter params from breadcrumb
    const buildFilterParams = React.useCallback((items: BreadcrumbItem[]): FilterParams | null => {
        const domainItem = items.find(item => item.step === "Domain")
        if (!domainItem) return null

        const params: FilterParams = { DomainId: domainItem.id }
        if (selectedUnitTypeCode && selectedDomain?.code === "quran") {
            params.UnitTypeCode = selectedUnitTypeCode
        }

        for (const item of items) {
            switch (item.step) {
                case "Curriculum": params.CurriculumId = item.id; break
                case "Level": params.LevelId = item.id; break
                case "Grade": params.GradeId = item.id; break
                case "Term": params.TermId = item.id; break
                case "Subject": params.SubjectId = item.id; break
            }
        }
        return params
    }, [selectedUnitTypeCode, selectedDomain])

    // Handle domain selection
    const handleSelectDomain = React.useCallback((domain: Domain) => {
        const newBreadcrumb: BreadcrumbItem[] = [{
            step: "Domain",
            id: domain.id,
            nameEn: domain.nameEn,
            nameAr: domain.nameAr,
        }]
        setBreadcrumb(newBreadcrumb)
        setSelectedDomain(domain)

        if (domain.code === "quran") {
            setCurrentStep("unitTypeSelection")
            setIsLoading(false)
        } else {
            loadFilter({ DomainId: domain.id })
        }
    }, [loadFilter])

    // Handle unit type selection (Quran)
    const handleSelectUnitType = React.useCallback((unitTypeCode: UnitTypeCode) => {
        if (!selectedDomain) return
        setSelectedUnitTypeCode(unitTypeCode)
        loadFilter({ DomainId: selectedDomain.id, UnitTypeCode: unitTypeCode })
    }, [selectedDomain, loadFilter])

    // Handle option selection
    const handleSelectOption = React.useCallback((option: Option, step: string) => {
        if (!filterData) return
        if (isQuranDomain && step === "Unit") return

        const newBreadcrumbItem: BreadcrumbItem = {
            step: step as StepType,
            id: option.id,
            nameEn: option.nameEn,
            nameAr: option.nameAr,
        }

        const newBreadcrumb = [...breadcrumb, newBreadcrumbItem]
        setBreadcrumb(newBreadcrumb)

        const params = buildFilterParams(newBreadcrumb)
        if (params) loadFilter(params)
    }, [filterData, isQuranDomain, breadcrumb, buildFilterParams, loadFilter])

    // Navigate breadcrumb
    const handleNavigate = React.useCallback((index: number) => {
        if (index < 0) {
            loadDomains()
            return
        }

        const newBreadcrumb = breadcrumb.slice(0, index + 1)
        setBreadcrumb(newBreadcrumb)

        const params = buildFilterParams(newBreadcrumb)
        if (params) loadFilter(params)
    }, [breadcrumb, buildFilterParams, loadFilter, loadDomains])

    // Generate nodes and edges with elegant tree layout
    React.useEffect(() => {
        const newNodes: Node[] = []
        const newEdges: Edge[] = []
        const isRTL = direction === "rtl"

        const NODE_WIDTH = 180
        const NODE_HEIGHT = 80
        const HORIZONTAL_GAP = 280
        const VERTICAL_GAP = 140

        // Add breadcrumb nodes in a horizontal line (the selected path)
        breadcrumb.forEach((item, index) => {
            const nodeId = `path-${item.step}-${item.id}`
            const xPos = index * HORIZONTAL_GAP

            newNodes.push({
                id: nodeId,
                type: "hierarchy",
                position: { x: isRTL ? -xPos : xPos, y: 0 },
                data: {
                    label: locale === "ar" ? item.nameAr : item.nameEn,
                    step: item.step,
                    isSelected: false,
                    isActive: true,
                    onClick: () => handleNavigate(index),
                    locale,
                },
                sourcePosition: isRTL ? Position.Left : Position.Right,
                targetPosition: isRTL ? Position.Right : Position.Left,
            })

            // Connect to previous node with glowing edge
            if (index > 0) {
                const prevNodeId = `path-${breadcrumb[index - 1].step}-${breadcrumb[index - 1].id}`
                newEdges.push({
                    id: `edge-path-${index}`,
                    source: isRTL ? nodeId : prevNodeId,
                    target: isRTL ? prevNodeId : nodeId,
                    type: "glow",
                    data: { isActive: true },
                })
            }
        })

        // Get current options
        const options = currentStep === "domains"
            ? domains.map(d => ({ ...d, step: "Domain" as const }))
            : currentStep === "unitTypeSelection"
                ? [
                    { id: 1, nameEn: "Surahs", nameAr: "السور", code: "QuranSurah", step: "UnitType" as const },
                    { id: 2, nameEn: "Juz (Parts)", nameAr: "الأجزاء", code: "QuranPart", step: "UnitType" as const },
                ]
                : filterData?.unit?.map(u => ({ ...u, step: "Unit" as const })) ||
                filterData?.options?.map(o => ({ ...o, step: filterData.nextStep as StepType })) || []

        // Calculate base position for options (after the path)
        const baseX = breadcrumb.length * HORIZONTAL_GAP
        const totalOptions = options.length
        const totalHeight = (totalOptions - 1) * VERTICAL_GAP
        const startY = -totalHeight / 2

        // Parent node for connection
        const parentNodeId = breadcrumb.length > 0
            ? `path-${breadcrumb[breadcrumb.length - 1].step}-${breadcrumb[breadcrumb.length - 1].id}`
            : null

        // Add option nodes in a vertical fan layout
        options.forEach((option, index) => {
            const nodeId = `option-${option.step}-${option.id}`
            const yPos = startY + (index * VERTICAL_GAP)

            // Create a slight curve effect by offsetting x based on distance from center
            const centerIndex = (totalOptions - 1) / 2
            const distanceFromCenter = Math.abs(index - centerIndex)
            const curveOffset = distanceFromCenter * 20

            newNodes.push({
                id: nodeId,
                type: "hierarchy",
                position: {
                    x: isRTL ? -(baseX + curveOffset) : (baseX + curveOffset),
                    y: yPos
                },
                data: {
                    label: locale === "ar" ? option.nameAr : option.nameEn,
                    step: option.step,
                    isSelected: false,
                    isActive: false,
                    onClick: () => {
                        if (currentStep === "domains") {
                            handleSelectDomain(option as Domain)
                        } else if (currentStep === "unitTypeSelection") {
                            handleSelectUnitType(option.code as UnitTypeCode)
                        } else {
                            handleSelectOption(option as Option, option.step)
                        }
                    },
                    locale,
                },
                sourcePosition: isRTL ? Position.Left : Position.Right,
                targetPosition: isRTL ? Position.Right : Position.Left,
            })

            // Connect from parent with elegant bezier edge
            if (parentNodeId) {
                newEdges.push({
                    id: `edge-option-${index}`,
                    source: isRTL ? nodeId : parentNodeId,
                    target: isRTL ? parentNodeId : nodeId,
                    type: "glow",
                    data: { isActive: false },
                })
            }
        })

        setNodes(newNodes)
        setEdges(newEdges)
    }, [breadcrumb, domains, filterData, currentStep, locale, direction, handleNavigate, handleSelectDomain, handleSelectUnitType, handleSelectOption, setNodes, setEdges])

    // Get current step label
    const getCurrentStepLabel = () => {
        if (currentStep === "domains") return locale === "ar" ? "النطاقات" : "Domains"
        if (currentStep === "unitTypeSelection") return locale === "ar" ? "نوع المحتوى" : "Content Type"
        if (filterData?.nextStep) {
            const labels = locale === "ar" ? {
                Curriculum: "المناهج", Level: "المراحل", Grade: "الصفوف",
                Term: "الفصول", Subject: "المواد", Unit: "الوحدات", Lesson: "الدروس"
            } : {
                Curriculum: "Curriculums", Level: "Levels", Grade: "Grades",
                Term: "Terms", Subject: "Subjects", Unit: "Units", Lesson: "Lessons"
            }
            return labels[filterData.nextStep as keyof typeof labels] || ""
        }
        return ""
    }

    return (
        <Card className={cn(
            "bg-card/50 backdrop-blur-sm border-border/50 transition-all duration-500 overflow-hidden",
            isExpanded && "fixed inset-4 z-50 bg-card"
        )}>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                        <IconSparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-foreground">{t("dashboard.contentHierarchy")}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {locale === "ar" ? "استكشف التسلسل الهرمي للمحتوى" : "Explore the content hierarchy"}
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                        {getCurrentStepLabel()}
                    </Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-secondary"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <IconMinimize className="h-4 w-4" /> : <IconMaximize className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-secondary"
                        onClick={loadDomains}
                        disabled={isLoading}
                    >
                        <IconRefresh className={cn("h-4 w-4", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Breadcrumb Navigation */}
                <div className="flex items-center gap-1.5 text-sm px-6 py-3 bg-secondary/30 border-b border-border/30 flex-wrap">
                    <button
                        onClick={() => handleNavigate(-1)}
                        className="text-muted-foreground hover:text-primary transition-colors font-medium"
                    >
                        {t("dashboard.contentHierarchy")}
                    </button>
                    {breadcrumb.map((item, index) => (
                        <React.Fragment key={`${item.step}-${item.id}`}>
                            <IconChevronRight className="h-4 w-4 text-muted-foreground/50 rtl:rotate-180" />
                            <button
                                onClick={() => handleNavigate(index)}
                                className={cn(
                                    "transition-colors font-medium",
                                    index === breadcrumb.length - 1
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-primary"
                                )}
                            >
                                {locale === "ar" ? item.nameAr : item.nameEn}
                            </button>
                        </React.Fragment>
                    ))}
                </div>

                {/* React Flow Canvas */}
                <div className={cn("w-full transition-all duration-300", isExpanded ? "h-[calc(100vh-200px)]" : "h-[450px]")}>
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : (
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            nodeTypes={nodeTypes}
                            edgeTypes={edgeTypes}
                            connectionLineType={ConnectionLineType.SmoothStep}
                            fitView
                            fitViewOptions={{ padding: 0.4, maxZoom: 1 }}
                            minZoom={0.3}
                            maxZoom={1.5}
                            proOptions={{ hideAttribution: true }}
                            className="bg-gradient-to-br from-background via-background to-secondary/20"
                        >
                            <Background
                                variant={BackgroundVariant.Dots}
                                gap={20}
                                size={1}
                                color="hsl(var(--muted-foreground) / 0.15)"
                            />
                            <Controls
                                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-lg"
                                showInteractive={false}
                            />
                            <MiniMap
                                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-lg"
                                nodeColor={(node) => {
                                    const step = (node.data as { step?: string })?.step || "Domain"
                                    const config = stepConfig[step]
                                    return config ? config.color.replace("text-", "").replace("-400", "") : "#666"
                                }}
                                maskColor="hsl(var(--background) / 0.8)"
                            />
                        </ReactFlow>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
