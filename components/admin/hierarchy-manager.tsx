"use client"

import * as React from "react"
import {
  IconWorld,
  IconBook,
  IconSchool,
  IconStack,
  IconCalendar,
  IconBookmark,
  IconPlus,
  IconSearch,
  IconChevronRight,
  IconEdit,
  IconTrash,
  IconRefresh,
  IconSparkles,
  IconCheck,
  IconAlertCircle,
  IconFolder,
  IconSquareCheck,
  IconSquare,
  IconNotebook,
  IconPlayerSkipForward,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ApiResponse, PaginatedResult } from "@/types/ApiResponse"
import { EducationDomainItem } from "@/collections/domain"
import { toast } from "sonner"

// Types
type HierarchyLevel = "Domain" | "Curriculum" | "Level" | "Grade" | "Subject" | "Term" | "Unit" | "Lesson"

interface Option {
  id: number
  nameEn: string
  nameAr: string
  code: string | null
  isActive?: boolean
  orderIndex?: number
}

// Full entity shape returned by GET-by-id (Domain / Curriculum / Subject), used to
// prefill the edit dialog with optional fields the slim filter-options list omits.
interface EntityDetail {
  nameEn?: string
  nameAr?: string
  code?: string | null
  country?: string | null
  descriptionEn?: string | null
  descriptionAr?: string | null
  isActive?: boolean
  orderIndex?: number
}

interface Domain {
  id: number
  nameEn: string
  nameAr: string
  code: string
  isActive?: boolean
}

interface FilterState {
  domainId: number | null
  curriculumId: number | null
  levelId: number | null
  gradeId: number | null
  subjectId: number | null
  termIds: number[] | null
  // Standard-path content selection
  contentUnitId: number | null
  lessonIds: number[] | null
  skipLessons: boolean
  // Quran-only (echo of the request params; not used to filter units)
  quranContentTypeId: number | null
  quranLevelId: number | null
  unitTypeCode: UnitTypeCode | null
}

interface HierarchyData {
  currentState: FilterState
  rule: {
    hasCurriculum: boolean
    hasEducationLevel: boolean
    hasGrade: boolean
    hasAcademicTerm: boolean
    hasContentUnits: boolean
    hasLessons?: boolean
    requiresQuranContentType?: boolean
    requiresQuranLevel?: boolean
    requiresUnitTypeSelection?: boolean
  }
  nextStep: string
  options: Option[]
  unit: Option[] | null
  totalCount: number | null
  pageNumber: number | null
  pageSize: number | null
  totalPages: number | null
  // Quran-only fields (preserved, not dropped)
  subject?: Option | null
  contentTypes?: Option[] | null
  levels?: Option[] | null
}

interface LevelConfig {
  key: HierarchyLevel
  icon: React.ElementType
  color: string
  bgColor: string
  gradient: string
  labelEn: string
  labelAr: string
  pluralEn: string
  pluralAr: string
}

// Level configurations
const levelConfigs: LevelConfig[] = [
  {
    key: "Domain",
    icon: IconWorld,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    gradient: "from-emerald-500 to-teal-500",
    labelEn: "Domain",
    labelAr: "النطاق",
    pluralEn: "Domains",
    pluralAr: "النطاقات",
  },
  {
    key: "Curriculum",
    icon: IconBook,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    gradient: "from-blue-500 to-cyan-500",
    labelEn: "Curriculum",
    labelAr: "المنهج",
    pluralEn: "Curriculums",
    pluralAr: "المناهج",
  },
  {
    key: "Level",
    icon: IconSchool,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    gradient: "from-amber-500 to-orange-500",
    labelEn: "Level",
    labelAr: "المرحلة",
    pluralEn: "Levels",
    pluralAr: "المراحل",
  },
  {
    key: "Grade",
    icon: IconStack,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    gradient: "from-purple-500 to-pink-500",
    labelEn: "Grade",
    labelAr: "الصف",
    pluralEn: "Grades",
    pluralAr: "الصفوف",
  },
  {
    key: "Subject",
    icon: IconFolder,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    gradient: "from-cyan-500 to-blue-500",
    labelEn: "Subject",
    labelAr: "المادة",
    pluralEn: "Subjects",
    pluralAr: "المواد",
  },
  {
    key: "Term",
    icon: IconCalendar,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    gradient: "from-rose-500 to-pink-500",
    labelEn: "Term",
    labelAr: "الفصل",
    pluralEn: "Terms",
    pluralAr: "الفصول",
  },
  {
    key: "Unit",
    icon: IconBookmark,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    gradient: "from-orange-500 to-amber-500",
    labelEn: "Unit",
    labelAr: "الوحدة",
    pluralEn: "Units",
    pluralAr: "الوحدات",
  },
  {
    key: "Lesson",
    icon: IconNotebook,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    gradient: "from-teal-500 to-emerald-500",
    labelEn: "Lesson",
    labelAr: "الدرس",
    pluralEn: "Lessons",
    pluralAr: "الدروس",
  },
]

const getConfig = (level: HierarchyLevel) => levelConfigs.find(c => c.key === level) || levelConfigs[0]

// Which levels expose which REST operations (see Education-Management-CRUD.md §13).
// Terms have no REST API at all; Levels/Grades/Units are create-only; Lessons are
// created from a separate flow. Only Domain/Curriculum/Subject support update + delete.
const CREATABLE_LEVELS: HierarchyLevel[] = ["Domain", "Curriculum", "Level", "Grade", "Subject", "Unit"]
const EDITABLE_LEVELS: HierarchyLevel[] = ["Domain", "Curriculum", "Subject"]
const DELETABLE_LEVELS: HierarchyLevel[] = ["Domain", "Curriculum", "Subject"]

// Content-unit type is derived from the domain (units are not created for Quran here —
// Quran surahs/parts are seeded reference data).
const getUnitTypeCode = (domainCode: string): string => {
  switch (domainCode) {
    case "language": return "LanguageModule"
    default: return "SchoolUnit"
  }
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
  if (params.TermIds) params.TermIds.forEach(termId => searchParams.append("TermIds", termId.toString()))
  if (params.SubjectId) searchParams.set("SubjectId", params.SubjectId.toString())

  // Unit -> Lesson step (standard path): a chosen unit advances past nextStep "Unit",
  // then lessons are picked (or skipped) to reach "Done".
  if (params.ContentUnitId) searchParams.set("ContentUnitId", params.ContentUnitId.toString())
  if (params.LessonIds) params.LessonIds.forEach(lessonId => searchParams.append("LessonIds", lessonId.toString()))
  if (params.SkipLessons) searchParams.set("SkipLessons", "true")

  // Quran-specific params (ignored by the API for non-Quran domains)
  if (params.UnitTypeCode) searchParams.set("UnitTypeCode", params.UnitTypeCode)
  if (params.PageNumber) searchParams.set("PageNumber", params.PageNumber.toString())
  if (params.PageSize) searchParams.set("PageSize", params.PageSize.toString())

  return `?${searchParams.toString()}`
}
// ==================== API FUNCTIONS ====================

async function fetchDomains(): Promise<{ data: { items: Domain[] } }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/Domains`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })
  const json: ApiResponse<PaginatedResult<EducationDomainItem> | EducationDomainItem[]> = await response.json()
  if (!json.succeeded || !json.data) {
    return { data: { items: [] } }
  }
  // Tolerate both a direct array and a paginated { items: [...] } envelope.
  const items = Array.isArray(json.data) ? json.data : json.data.items ?? []
  return { data: { items: items as Domain[] } }
}

type UnitTypeCode = "QuranPart" | "QuranSurah"

interface FilterParams {
  DomainId: number
  CurriculumId?: number
  LevelId?: number
  GradeId?: number
  SubjectId?: number
  TermIds?: number[]
  // Standard-path content selection (not used by Quran)
  ContentUnitId?: number
  LessonIds?: number[]
  SkipLessons?: boolean
  // Quran-only (ignored by the API for other domains)
  UnitTypeCode?: UnitTypeCode
  PageNumber?: number
  PageSize?: number
}

async function fetchHierarchy(params: FilterParams): Promise<{ data: HierarchyData }> {
  const queryString = buildFilterQueryString(params)

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Education/filter-options${queryString}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })
  const data: ApiResponse<HierarchyData> = await response.json()
  if (!response.ok || !data.succeeded || !data.data)
    // Surface the server message (e.g. "DomainId is required",
    // "LevelId is required before selecting Grade", "Quran subject not found").
    throw new Error(data.message || 'Failed to fetch filter data')
  return {
    data: data.data
  }
}

// ==================== BREADCRUMB ITEM ====================
interface BreadcrumbItem {
  level: HierarchyLevel
  id: number
  ids?: number[]  // For multi-select (Terms)
  nameEn: string
  nameAr: string
}

// ==================== MAIN COMPONENT ====================
export function HierarchyManager() {
  const { locale, direction } = useLocale()

  // State
  const [domains, setDomains] = React.useState<Domain[]>([])
  const [selectedDomain, setSelectedDomain] = React.useState<Domain | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [hierarchyLoading, setHierarchyLoading] = React.useState(false)
  const [hierarchyData, setHierarchyData] = React.useState<HierarchyData | null>(null)
  const [breadcrumb, setBreadcrumb] = React.useState<BreadcrumbItem[]>([])
  const [selectedTerms, setSelectedTerms] = React.useState<Option[]>([])
  const [isTermSelectMode, setIsTermSelectMode] = React.useState(false)
  const [selectedLessons, setSelectedLessons] = React.useState<Option[]>([])
  const [isLessonSelectMode, setIsLessonSelectMode] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Quran-specific state (Quran lists units directly, paginated, split by unit type)
  const [quranUnitType, setQuranUnitType] = React.useState<UnitTypeCode>("QuranPart")
  const [pageNumber, setPageNumber] = React.useState(1)
  const isQuranDomain = selectedDomain?.code === "quran"

  // Dialogs
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [showEditDialog, setShowEditDialog] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<Option | null>(null)
  const [addLevel, setAddLevel] = React.useState<HierarchyLevel>("Domain")

  // Form state
  const [formNameEn, setFormNameEn] = React.useState("")
  const [formNameAr, setFormNameAr] = React.useState("")
  const [formIsActive, setFormIsActive] = React.useState(true)
  const [formCode, setFormCode] = React.useState("")            // Domain only (required)
  const [formCountry, setFormCountry] = React.useState("")      // Curriculum only
  const [formDescriptionEn, setFormDescriptionEn] = React.useState("")
  const [formDescriptionAr, setFormDescriptionAr] = React.useState("")
  const [formOrderIndex, setFormOrderIndex] = React.useState(1) // Level / Grade / Unit

  // Load domains on mount
  React.useEffect(() => {
    loadDomains()
  }, [])

  const loadDomains = async () => {
    setLoading(true)
    try {
      const response = await fetchDomains()
      setDomains(response.data.items ?? [])
    } catch (error) {
      console.error("Failed to load domains:", error)
    } finally {
      setLoading(false)
    }
  }

  // Load hierarchy when domain is selected or breadcrumb changes
  const loadHierarchy = React.useCallback(async (params: FilterParams) => {
    setHierarchyLoading(true)
    try {
      const response = await fetchHierarchy(params)
      setHierarchyData(response.data)

      // Check if we're at Term selection step
      if (response.data.nextStep === "Term") {
        setIsTermSelectMode(true)
      } else {
        setIsTermSelectMode(false)
        setSelectedTerms([])
      }

      // Lesson is an optional multi-select step (standard path, after a unit is chosen)
      if (response.data.nextStep === "Lesson") {
        setIsLessonSelectMode(true)
      } else {
        setIsLessonSelectMode(false)
        setSelectedLessons([])
      }
    } catch (error) {
      console.error("Failed to load hierarchy:", error)
      toast.error(error instanceof Error ? error.message : "Failed to load filter data")
    } finally {
      setHierarchyLoading(false)
    }
  }, [])

  // Build filter params from breadcrumb. For Quran, inject unit-type + pagination
  // (overrides let callers pass fresh values without waiting on async state updates).
  const buildFilterParams = (
    items: BreadcrumbItem[],
    domain: Domain,
    quranOverrides?: { unitType?: UnitTypeCode; page?: number },
    skipLessons?: boolean
  ): FilterParams => {
    const params: FilterParams = { DomainId: domain.id }

    for (const item of items) {
      switch (item.level) {
        case "Curriculum": params.CurriculumId = item.id; break
        case "Level": params.LevelId = item.id; break
        case "Grade": params.GradeId = item.id; break
        case "Subject": params.SubjectId = item.id; break
        case "Term": params.TermIds = item.ids || [item.id]; break
        // Quran units are terminal; only the standard path advances past Unit.
        case "Unit": if (domain.code !== "quran") params.ContentUnitId = item.id; break
        case "Lesson": params.LessonIds = item.ids || [item.id]; break
      }
    }

    if (skipLessons) params.SkipLessons = true

    if (domain.code === "quran") {
      params.UnitTypeCode = quranOverrides?.unitType ?? quranUnitType
      params.PageNumber = quranOverrides?.page ?? pageNumber
      params.PageSize = 20
    }

    return params
  }

  // Handle domain selection
  const handleSelectDomain = (domain: Domain) => {
    setSelectedDomain(domain)
    setBreadcrumb([])
    setSelectedTerms([])
    setIsTermSelectMode(false)
    setSelectedLessons([])
    setIsLessonSelectMode(false)
    setQuranUnitType("QuranPart")
    setPageNumber(1)
    loadHierarchy(buildFilterParams([], domain, { unitType: "QuranPart", page: 1 }))
  }

  // Quran: switch between Surahs (114) and Juz/Parts (30)
  const handleQuranUnitTypeChange = (unitType: UnitTypeCode) => {
    if (!selectedDomain) return
    setQuranUnitType(unitType)
    setPageNumber(1)
    loadHierarchy(buildFilterParams(breadcrumb, selectedDomain, { unitType, page: 1 }))
  }

  // Quran: paginate the unit list
  const handleQuranPageChange = (page: number) => {
    if (!selectedDomain) return
    setPageNumber(page)
    loadHierarchy(buildFilterParams(breadcrumb, selectedDomain, { unitType: quranUnitType, page }))
  }

  // Handle option selection
  const handleSelectOption = (option: Option, level: HierarchyLevel) => {
    if (!selectedDomain) return

    // For Terms, toggle selection in multi-select mode
    if (level === "Term" && isTermSelectMode) {
      const exists = selectedTerms.find(t => t.id === option.id)
      if (exists) {
        setSelectedTerms(selectedTerms.filter(t => t.id !== option.id))
      } else {
        setSelectedTerms([...selectedTerms, option])
      }
      return
    }

    // For Lessons, toggle selection in multi-select mode
    if (level === "Lesson" && isLessonSelectMode) {
      const exists = selectedLessons.find(l => l.id === option.id)
      if (exists) {
        setSelectedLessons(selectedLessons.filter(l => l.id !== option.id))
      } else {
        setSelectedLessons([...selectedLessons, option])
      }
      return
    }

    const newBreadcrumb: BreadcrumbItem = {
      level,
      id: option.id,
      nameEn: option.nameEn,
      nameAr: option.nameAr,
    }

    const newBreadcrumbs = [...breadcrumb, newBreadcrumb]
    setBreadcrumb(newBreadcrumbs)

    const params = buildFilterParams(newBreadcrumbs, selectedDomain)
    loadHierarchy(params)
  }

  // Confirm term selection
  const handleConfirmTerms = () => {
    if (!selectedDomain || selectedTerms.length === 0) return

    const termItem: BreadcrumbItem = {
      level: "Term",
      id: selectedTerms[0].id,
      ids: selectedTerms.map(t => t.id),
      nameEn: selectedTerms.map(t => t.nameEn).join(", "),
      nameAr: selectedTerms.map(t => t.nameAr).join("، "),
    }

    const newBreadcrumbs = [...breadcrumb, termItem]
    setBreadcrumb(newBreadcrumbs)
    setIsTermSelectMode(false)

    const params = buildFilterParams(newBreadcrumbs, selectedDomain)
    loadHierarchy(params)
  }

  // Confirm lesson selection (sends lessonIds -> Done)
  const handleConfirmLessons = () => {
    if (!selectedDomain || selectedLessons.length === 0) return

    const lessonItem: BreadcrumbItem = {
      level: "Lesson",
      id: selectedLessons[0].id,
      ids: selectedLessons.map(l => l.id),
      nameEn: selectedLessons.map(l => l.nameEn).join(", "),
      nameAr: selectedLessons.map(l => l.nameAr).join("، "),
    }

    const newBreadcrumbs = [...breadcrumb, lessonItem]
    setBreadcrumb(newBreadcrumbs)
    setIsLessonSelectMode(false)

    const params = buildFilterParams(newBreadcrumbs, selectedDomain)
    loadHierarchy(params)
  }

  // Skip the lesson step (sends skipLessons=true -> Done)
  const handleSkipLessons = () => {
    if (!selectedDomain) return
    setIsLessonSelectMode(false)
    setSelectedLessons([])
    const params = buildFilterParams(breadcrumb, selectedDomain, undefined, true)
    loadHierarchy(params)
  }

  // Navigate to breadcrumb index
  const handleNavigate = (index: number) => {
    if (!selectedDomain) return

    if (index < 0) {
      // Back to domain view
      setBreadcrumb([])
      setSelectedTerms([])
      setIsTermSelectMode(false)
      setSelectedLessons([])
      setIsLessonSelectMode(false)
      setPageNumber(1)
      loadHierarchy(buildFilterParams([], selectedDomain, { unitType: quranUnitType, page: 1 }))
      return
    }

    const newBreadcrumbs = breadcrumb.slice(0, index + 1)
    setBreadcrumb(newBreadcrumbs)
    setSelectedTerms([])
    setSelectedLessons([])

    const params = buildFilterParams(newBreadcrumbs, selectedDomain)
    loadHierarchy(params)
  }

  // Get current level label
  const getCurrentLevelLabel = () => {
    if (!hierarchyData) return ""
    const config = getConfig(hierarchyData.nextStep as HierarchyLevel)
    return locale === "ar" ? config.pluralAr : config.pluralEn
  }

  // Filter options by search
  const filteredOptions = React.useMemo(() => {
    const items = hierarchyData?.nextStep === "Unit"
      ? hierarchyData?.unit || []
      : hierarchyData?.options || []

    if (!searchQuery) return items

    const query = searchQuery.toLowerCase()
    return items.filter(item =>
      item.nameEn.toLowerCase().includes(query) ||
      item.nameAr.includes(query)
    )
  }, [hierarchyData, searchQuery])

  // Handle add new item
  const handleAdd = (level: HierarchyLevel) => {
    setAddLevel(level)
    setFormNameEn("")
    setFormNameAr("")
    setFormIsActive(true)
    setFormCode("")
    setFormCountry("")
    setFormDescriptionEn("")
    setFormDescriptionAr("")
    setFormOrderIndex(1)
    setShowAddDialog(true)
  }

  // Handle edit item. Prefill optimistically from the slim option, then fetch the full
  // entity (GET by id) so optional fields — country, descriptions — aren't nulled on save.
  const handleEdit = async (level: HierarchyLevel | null, item: Option) => {
    if (!level) return
    setAddLevel(level)
    setSelectedItem(item)
    setFormNameEn(item.nameEn)
    setFormNameAr(item.nameAr)
    setFormIsActive(item.isActive ?? true)
    setFormCode(item.code ?? "")
    setFormCountry("")
    setFormDescriptionEn("")
    setFormDescriptionAr("")
    setFormOrderIndex(item.orderIndex ?? 1)
    setShowEditDialog(true)

    try {
      const res = await fetch(buildEntityUrl(level, item.id), {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Accept-Language": locale === "ar" ? "ar-EG" : "en-US",
        },
      })
      const json: ApiResponse<EntityDetail> = await res.json()
      if (res.ok && json.succeeded && json.data) {
        const d = json.data
        setFormNameEn(d.nameEn ?? item.nameEn)
        setFormNameAr(d.nameAr ?? item.nameAr)
        setFormCode(d.code ?? item.code ?? "")
        setFormCountry(d.country ?? "")
        setFormDescriptionEn(d.descriptionEn ?? "")
        setFormDescriptionAr(d.descriptionAr ?? "")
        setFormIsActive(d.isActive ?? true)
        setFormOrderIndex(d.orderIndex ?? item.orderIndex ?? 1)
      }
    } catch {
      // keep the optimistic values from the slim option
    }
  }

  // Handle delete item
  const handleDelete = (item: Option) => {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  // Build the request body for a given level, matching the documented API shape
  // (Education-Management-CRUD.md §6–§10). Each entity only sends the FKs/fields it accepts.
  const buildEntityPayload = (level: HierarchyLevel): Record<string, unknown> => {
    const curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
    const levelId = breadcrumb.find(b => b.level === "Level")?.id
    const gradeId = breadcrumb.find(b => b.level === "Grade")?.id
    const subjectId = breadcrumb.find(b => b.level === "Subject")?.id
    const termItem = breadcrumb.find(b => b.level === "Term")
    const termId = termItem?.ids?.[0] ?? termItem?.id ?? null

    switch (level) {
      case "Domain":
        return {
          nameEn: formNameEn,
          nameAr: formNameAr,
          code: formCode,
          descriptionEn: formDescriptionEn || null,
          descriptionAr: formDescriptionAr || null,
          isActive: formIsActive,
        }
      case "Curriculum":
        return {
          domainId: selectedDomain?.id,
          nameEn: formNameEn,
          nameAr: formNameAr,
          country: formCountry || null,
          descriptionEn: formDescriptionEn || null,
          descriptionAr: formDescriptionAr || null,
          isActive: formIsActive,
        }
      case "Level":
        return {
          nameEn: formNameEn,
          nameAr: formNameAr,
          domainId: selectedDomain?.id,
          curriculumId,
          orderIndex: formOrderIndex,
          isActive: formIsActive,
        }
      case "Grade":
        return {
          nameEn: formNameEn,
          nameAr: formNameAr,
          levelId,
          orderIndex: formOrderIndex,
          isActive: formIsActive,
        }
      case "Subject":
        return {
          nameEn: formNameEn,
          nameAr: formNameAr,
          descriptionEn: formDescriptionEn || null,
          descriptionAr: formDescriptionAr || null,
          domainId: selectedDomain?.id,
          curriculumId,
          levelId,
          gradeId,
          termId,
          isActive: formIsActive,
        }
      case "Unit":
        // Content-unit shape per §10: subjectId + termId + orderIndex + unitTypeCode.
        return {
          nameEn: formNameEn,
          nameAr: formNameAr,
          subjectId,
          termId,
          orderIndex: formOrderIndex,
          unitTypeCode: getUnitTypeCode(selectedDomain?.code ?? ""),
        }
      default:
        return { nameEn: formNameEn, nameAr: formNameAr }
    }
  }

  // Resolve the REST endpoint for a level. `id` appends the path segment for PUT/DELETE.
  const buildEntityUrl = (level: HierarchyLevel, id?: number): string => {
    const base = `${process.env.NEXT_PUBLIC_API_URL}`
    const suffix = id != null ? `/${id}` : ""
    switch (level) {
      case "Domain": return `${base}/Api/V1/Education/Domains${suffix}`
      case "Curriculum": return `${base}/Api/V1/Curriculum${suffix}`
      case "Level": return `${base}/Api/V1/Education/Levels${suffix}`
      case "Grade": return `${base}/Api/V1/Education/Grades${suffix}`
      case "Subject": return `${base}/Api/V1/Subjects${suffix}`
      case "Unit": return `${base}/Api/V1/Content/Units${suffix}`
      default: return `${base}/Api/V1/Education/Domains${suffix}`
    }
  }

  // Submit add form
  const submitAdd = async () => {
    if (!selectedDomain) return
    const payload = buildEntityPayload(addLevel)
    const url = buildEntityUrl(addLevel)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        "Accept": "application/json",
        "Accept-Language": locale === "ar" ? "ar-EG" : "en-US",
      },
      body: JSON.stringify(payload),
    })
    const json: ApiResponse<unknown> = await response.json()
    if (!json.succeeded) {
      toast.error(json.message)
      return
    }
    toast.success(json.message)
    setShowAddDialog(false)

    // Refresh data
    const params = buildFilterParams(breadcrumb, selectedDomain)
    loadHierarchy(params)
  }

  // Submit edit form (Domain / Curriculum / Subject only — see EDITABLE_LEVELS)
  const submitEdit = async () => {
    if (!selectedItem || !addLevel || !selectedDomain) return

    // Body mirrors create + the route id (PUT requires body id === route id).
    const payload = { ...buildEntityPayload(addLevel), id: selectedItem.id }
    const url = buildEntityUrl(addLevel, selectedItem.id)

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        "Accept": "application/json",
        "Accept-Language": locale === "ar" ? "ar-EG" : "en-US",
      },
      body: JSON.stringify(payload),
    })
    const json: ApiResponse<unknown> = await response.json()
    if (!json.succeeded) {
      toast.error(json.message)
      return
    }
    toast.success(json.message)
    setShowEditDialog(false)

    // Refresh data
    const params = buildFilterParams(breadcrumb, selectedDomain)
    loadHierarchy(params)
  }

  // Submit delete (Domain / Curriculum / Subject only — see DELETABLE_LEVELS)
  const submitDelete = async () => {
    if (!selectedItem || !hierarchyData) return

    const currentLevel = hierarchyData.nextStep as HierarchyLevel
    const url = buildEntityUrl(currentLevel, selectedItem.id)
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        "Accept": "application/json",
        "Accept-Language": locale === "ar" ? "ar-EG" : "en-US",
      },
    })
    const json: ApiResponse<unknown> = await response.json()
    if (!json.succeeded) {
      toast.error(json.message)
      return
    }
    toast.success(json.message)
    setShowDeleteDialog(false)

    // Refresh data
    if (selectedDomain) {
      const params = buildFilterParams(breadcrumb, selectedDomain)
      loadHierarchy(params)
    }
  }

  // ==================== RENDER FUNCTIONS ====================

  // Render empty state (no domains)
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 rounded-full blur-2xl" />
        <div className="relative p-6 rounded-full bg-linear-to-br from-card to-secondary/30 border border-border/50">
          <IconFolder className="h-16 w-16 text-muted-foreground" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-2">
        {locale === "ar" ? "لا توجد نطاقات" : "No Domains Yet"}
      </h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {locale === "ar"
          ? "ابدأ بإضافة نطاق جديد لبناء التسلسل الهرمي للمحتوى التعليمي"
          : "Start by adding a new domain to build your educational content hierarchy"
        }
      </p>
      <Button
        onClick={() => handleAdd("Domain")}
        className="gap-2 bg-linear-to-r from-primary to-primary/80"
      >
        <IconPlus className="h-4 w-4" />
        {locale === "ar" ? "إضافة نطاق جديد" : "Add New Domain"}
      </Button>
    </div>
  )

  // Render domain selector
  const renderDomainSelector = () => (
    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border border-border/50">
      <div className={cn("p-2.5 rounded-xl", getConfig("Domain").bgColor)}>
        <IconWorld className={cn("h-5 w-5", getConfig("Domain").color)} />
      </div>
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1 block">
          {locale === "ar" ? "اختر النطاق" : "Select Domain"}
        </Label>
        <Select
          value={selectedDomain?.nameEn.toString() || ""}
          onValueChange={(value) => {
            const domain = domains.find(d => d[locale === "ar" ? "nameAr" : "nameEn"].toString() === value)
            if (domain) handleSelectDomain(domain)
          }}
        >
          <SelectTrigger className="w-full bg-background border-border/50">
            <SelectValue placeholder={locale === "ar" ? "اختر نطاقًا..." : "Choose a domain..."} />
          </SelectTrigger>
          <SelectContent>
            {domains.map(domain => (
              <SelectItem key={domain.id} value={locale === "ar" ? domain.nameAr : domain.nameEn}>
                <div className="flex items-center gap-2">
                  <span>{locale === "ar" ? domain.nameAr : domain.nameEn}</span>
                  {domain.isActive === false && (
                    <Badge variant="outline" className="text-xs">
                      {locale === "ar" ? "غير نشط" : "Inactive"}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button variant="outline" size="icon" onClick={() => handleAdd("Domain")}>
                <IconPlus className="h-4 w-4" />
              </Button>
            }
          />
          <TooltipContent>
            {locale === "ar" ? "إضافة نطاق" : "Add Domain"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )

  // Render breadcrumb navigation
  const renderBreadcrumb = () => (
    <div className="flex items-center gap-1.5 text-sm flex-wrap">
      <button
        onClick={() => handleNavigate(-1)}
        className="text-muted-foreground hover:text-primary transition-colors font-medium"
      >
        {selectedDomain && (locale === "ar" ? selectedDomain.nameAr : selectedDomain.nameEn)}
      </button>
      {breadcrumb.map((item, index) => (
        <React.Fragment key={`${item.level}-${item.id}`}>
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
  )

  // Render option item
  const renderOptionItem = (option: Option, level: HierarchyLevel) => {
    const config = getConfig(level)
    const Icon = config.icon
    const isTermSelected = isTermSelectMode && level === "Term" && selectedTerms.some(t => t.id === option.id)
    const isLessonSelected = isLessonSelectMode && level === "Lesson" && selectedLessons.some(l => l.id === option.id)
    const isSelected = isTermSelected || isLessonSelected
    const inSelectMode = (isTermSelectMode && level === "Term") || (isLessonSelectMode && level === "Lesson")
    const isUnit = level === "Unit"
    // Quran units are terminal; standard-path units advance (send contentUnitId -> Lesson/Done).
    const isClickable = !(isUnit && isQuranDomain)
    // Only Domain/Curriculum/Subject expose update + delete in the API (§13).
    const canEdit = EDITABLE_LEVELS.includes(level)
    const canDelete = DELETABLE_LEVELS.includes(level)

    return (
      <div
        key={option.id}
        onClick={() => isClickable && handleSelectOption(option, level)}
        className={cn(
          "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
          isSelected
            ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
            : "bg-card/50 border-border/30 hover:border-primary/30 hover:bg-card",
          isClickable ? "cursor-pointer" : "cursor-default"
        )}
      >
        {/* Checkbox for multi-select steps (terms, lessons) */}
        {inSelectMode && (
          <div className="shrink-0">
            {isSelected ? (
              <IconSquareCheck className="h-5 w-5 text-primary" />
            ) : (
              <IconSquare className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
            )}
          </div>
        )}

        {/* Icon */}
        <div className={cn("p-2.5 rounded-xl transition-colors", config.bgColor)}>
          <Icon className={cn("h-5 w-5", config.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {locale === "ar" ? option.nameAr : option.nameEn}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {locale === "ar" ? option.nameEn : option.nameAr}
          </p>
        </div>

        {/* Actions — only the levels the API supports (Domain/Curriculum/Subject).
            Levels, Grades, Terms, Units and Lessons have no update/delete endpoint. */}
        {(canEdit || canDelete) && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canEdit && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); handleEdit(hierarchyData?.nextStep as HierarchyLevel | null, option) }}
                  >
                    <IconEdit className="h-4 w-4" />
                  </Button>
                }
              />
              <TooltipContent>{locale === "ar" ? "تعديل" : "Edit"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          )}
          {canDelete && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(option) }}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                }
              />
              <TooltipContent>{locale === "ar" ? "حذف" : "Delete"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          )}
        </div>
        )}

        {/* Arrow for clickable, non-multi-select items */}
        {isClickable && !inSelectMode && (
          <IconChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors rtl:rotate-180" />
        )}
      </div>
    )
  }

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/30 bg-card/50">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  )

  // Level-specific form fields shared by the Add and Edit dialogs.
  // Each entity only collects the fields its API accepts (§6–§10).
  const renderLevelFields = () => (
    <>
      {addLevel === "Domain" && (
        <div className="space-y-2">
          <Label>{locale === "ar" ? "الرمز" : "Code"}</Label>
          <Input
            value={formCode}
            onChange={(e) => setFormCode(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
            placeholder="school"
            dir="ltr"
          />
          <p className="text-xs text-muted-foreground">
            {locale === "ar"
              ? "أحرف إنجليزية صغيرة وأرقام و _ فقط"
              : "Lowercase letters, numbers and _ only"}
          </p>
        </div>
      )}

      {addLevel === "Curriculum" && (
        <div className="space-y-2">
          <Label>{locale === "ar" ? "الدولة" : "Country"}</Label>
          <Input
            value={formCountry}
            onChange={(e) => setFormCountry(e.target.value)}
            placeholder="SA"
            dir="ltr"
          />
        </div>
      )}

      {(addLevel === "Level" || addLevel === "Grade" || addLevel === "Unit") && (
        <div className="space-y-2">
          <Label>{locale === "ar" ? "الترتيب" : "Order Index"}</Label>
          <Input
            type="number"
            min={0}
            value={formOrderIndex}
            onChange={(e) => setFormOrderIndex(Number(e.target.value) || 0)}
            dir="ltr"
          />
        </div>
      )}

      {(addLevel === "Domain" || addLevel === "Curriculum" || addLevel === "Subject") && (
        <>
          <div className="space-y-2">
            <Label>{locale === "ar" ? "الوصف بالإنجليزية" : "English Description"}</Label>
            <Input
              value={formDescriptionEn}
              onChange={(e) => setFormDescriptionEn(e.target.value)}
              placeholder={locale === "ar" ? "اختياري" : "Optional"}
            />
          </div>
          <div className="space-y-2">
            <Label>{locale === "ar" ? "الوصف بالعربية" : "Arabic Description"}</Label>
            <Input
              value={formDescriptionAr}
              onChange={(e) => setFormDescriptionAr(e.target.value)}
              placeholder={locale === "ar" ? "اختياري" : "Optional"}
              dir="rtl"
            />
          </div>
        </>
      )}

      {/* Content units have no isActive flag in the API */}
      {addLevel !== "Unit" && (
        <div className="flex items-center justify-between">
          <Label>{locale === "ar" ? "نشط" : "Active"}</Label>
          <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
        </div>
      )}
    </>
  )

  // ==================== MAIN RENDER ====================
  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 rounded-lg bg-linear-to-br from-primary/20 to-primary/5">
              <IconSparkles className="h-6 w-6 text-primary" />
            </div>
            {locale === "ar" ? "إدارة التسلسل الهرمي" : "Hierarchy Manager"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {locale === "ar"
              ? "إدارة هيكل المحتوى التعليمي بالكامل من مكان واحد"
              : "Manage your entire educational content structure from one place"
            }
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={loadDomains}
          disabled={loading}
        >
          <IconRefresh className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Loading state */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-14 w-full rounded-xl" />
              {renderSkeleton()}
            </div>
          </CardContent>
        </Card>
      ) : (domains?.length ?? 0) === 0 ? (
        <Card>
          <CardContent className="p-0">
            {renderEmptyState()}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-4">
            {/* Domain Selector */}
            {renderDomainSelector()}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Only show content if domain is selected */}
            {selectedDomain ? (
              <>
                {/* Breadcrumb + Search */}
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {renderBreadcrumb()}

                  <div className="flex items-center gap-2">
                    {/* Term confirm button */}
                    {isTermSelectMode && selectedTerms.length > 0 && (
                      <Button onClick={handleConfirmTerms} size="sm" className="gap-2">
                        <IconCheck className="h-4 w-4" />
                        {locale === "ar"
                          ? `تأكيد (${selectedTerms.length})`
                          : `Confirm (${selectedTerms.length})`
                        }
                      </Button>
                    )}

                    {/* Lesson step buttons: confirm selected lessons or skip the step */}
                    {isLessonSelectMode && (
                      <>
                        {selectedLessons.length > 0 && (
                          <Button onClick={handleConfirmLessons} size="sm" className="gap-2">
                            <IconCheck className="h-4 w-4" />
                            {locale === "ar"
                              ? `تأكيد (${selectedLessons.length})`
                              : `Confirm (${selectedLessons.length})`
                            }
                          </Button>
                        )}
                        <Button onClick={handleSkipLessons} size="sm" variant="outline" className="gap-2">
                          <IconPlayerSkipForward className="h-4 w-4 rtl:rotate-180" />
                          {locale === "ar" ? "تخطي الدروس" : "Skip Lessons"}
                        </Button>
                      </>
                    )}

                    {/* Search */}
                    <div className="relative">
                      <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                      <Input
                        placeholder={locale === "ar" ? "بحث..." : "Search..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-48 rtl:pl-3 rtl:pr-9"
                      />
                    </div>

                    {/* Add button — only for levels the API can create, and never for
                        Quran units (those are seeded reference data). */}
                    {hierarchyData &&
                      CREATABLE_LEVELS.includes(hierarchyData.nextStep as HierarchyLevel) &&
                      !(hierarchyData.nextStep === "Unit" && isQuranDomain) && (
                      <Button
                        onClick={() => handleAdd(hierarchyData.nextStep as HierarchyLevel)}
                        size="sm"
                        className="gap-2"
                      >
                        <IconPlus className="h-4 w-4" />
                        {locale === "ar" ? "إضافة" : "Add"} {getCurrentLevelLabel()}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Current level label */}
                {hierarchyData && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-xs font-semibold",
                      getConfig(hierarchyData.nextStep as HierarchyLevel).color
                    )}>
                      {isTermSelectMode
                        ? (locale === "ar" ? "اختر الفصول الدراسية (متعدد)" : "Select Terms (Multi)")
                        : isLessonSelectMode
                        ? (locale === "ar" ? "اختر الدروس (اختياري، متعدد)" : "Select Lessons (Optional, Multi)")
                        : getCurrentLevelLabel()
                      }
                    </Badge>
                    {hierarchyData.totalCount !== null && (
                      <span className="text-xs text-muted-foreground">
                        ({hierarchyData.totalCount} {locale === "ar" ? "عنصر" : "items"})
                      </span>
                    )}
                  </div>
                )}

                {/* Quran unit-type toggle (Surahs vs Juz) */}
                {isQuranDomain && hierarchyData?.nextStep === "Unit" && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={quranUnitType === "QuranPart" ? "default" : "outline"}
                      onClick={() => handleQuranUnitTypeChange("QuranPart")}
                    >
                      {locale === "ar" ? "الأجزاء (30)" : "Juz (30)"}
                    </Button>
                    <Button
                      size="sm"
                      variant={quranUnitType === "QuranSurah" ? "default" : "outline"}
                      onClick={() => handleQuranUnitTypeChange("QuranSurah")}
                    >
                      {locale === "ar" ? "السور (114)" : "Surahs (114)"}
                    </Button>
                  </div>
                )}

                {/* Quran info panel: auto-selected subject + available content types / levels.
                    These are informational only — the API echoes quranContentTypeId/quranLevelId
                    in currentState and does NOT use them to filter the unit list. */}
                {isQuranDomain && hierarchyData?.nextStep === "Unit" && (
                  (hierarchyData?.subject ||
                    (hierarchyData?.rule.requiresQuranContentType && hierarchyData?.contentTypes?.length) ||
                    (hierarchyData?.rule.requiresQuranLevel && hierarchyData?.levels?.length)) && (
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                      {hierarchyData?.subject && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {locale === "ar" ? "المادة" : "Subject"}:
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {locale === "ar" ? hierarchyData.subject.nameAr : hierarchyData.subject.nameEn}
                          </Badge>
                        </div>
                      )}
                      {hierarchyData?.rule.requiresQuranContentType && (hierarchyData?.contentTypes?.length ?? 0) > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {locale === "ar" ? "أنواع المحتوى" : "Content Types"}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {hierarchyData?.contentTypes?.map(ct => (
                              <Badge key={ct.id} variant="outline" className="text-xs">
                                {locale === "ar" ? ct.nameAr : ct.nameEn}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {hierarchyData?.rule.requiresQuranLevel && (hierarchyData?.levels?.length ?? 0) > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {locale === "ar" ? "المستويات" : "Levels"}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {hierarchyData?.levels?.map(lv => (
                              <Badge key={lv.id} variant="outline" className="text-xs">
                                {locale === "ar" ? lv.nameAr : lv.nameEn}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* Done: terminal state for domains/branches with no content units */}
                {hierarchyData?.nextStep === "Done" && !hierarchyLoading && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-10 text-muted-foreground">
                    <IconBookmark className="h-10 w-10 mb-3 opacity-50" />
                    <p className="font-medium">
                      {locale === "ar" ? "اكتمل التحديد" : "Selection complete"}
                    </p>
                    <p className="text-sm">
                      {locale === "ar" ? "لا توجد وحدات لهذا المسار" : "No units available for this path"}
                    </p>
                  </div>
                )}

                {/* Options list */}
                {hierarchyLoading ? (
                  renderSkeleton()
                ) : hierarchyData?.nextStep === "Done" ? null : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-2">
                      {filteredOptions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <IconAlertCircle className="h-10 w-10 mb-3 opacity-50" />
                          <p>{locale === "ar" ? "لا توجد عناصر" : "No items found"}</p>
                        </div>
                      ) : (
                        filteredOptions.map(option =>
                          renderOptionItem(option, hierarchyData?.nextStep as HierarchyLevel || "Unit")
                        )
                      )}
                    </div>
                  </ScrollArea>
                )}

                {/* Quran pagination (only meaningful for Quran units) */}
                {isQuranDomain && hierarchyData?.nextStep === "Unit" && (hierarchyData?.totalPages ?? 1) > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={(hierarchyData?.pageNumber ?? pageNumber) <= 1 || hierarchyLoading}
                      onClick={() => handleQuranPageChange((hierarchyData?.pageNumber ?? pageNumber) - 1)}
                    >
                      <IconChevronRight className="h-4 w-4 rotate-180 rtl:rotate-0" />
                      {locale === "ar" ? "السابق" : "Previous"}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {locale === "ar"
                        ? `صفحة ${hierarchyData?.pageNumber ?? pageNumber} من ${hierarchyData?.totalPages ?? 1}`
                        : `Page ${hierarchyData?.pageNumber ?? pageNumber} of ${hierarchyData?.totalPages ?? 1}`}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={(hierarchyData?.pageNumber ?? pageNumber) >= (hierarchyData?.totalPages ?? 1) || hierarchyLoading}
                      onClick={() => handleQuranPageChange((hierarchyData?.pageNumber ?? pageNumber) + 1)}
                    >
                      {locale === "ar" ? "التالي" : "Next"}
                      <IconChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <IconWorld className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-lg font-medium">
                  {locale === "ar" ? "اختر نطاقًا للبدء" : "Select a domain to begin"}
                </p>
                <p className="text-sm">
                  {locale === "ar"
                    ? "اختر نطاقًا من القائمة أعلاه لعرض التسلسل الهرمي"
                    : "Choose a domain from the dropdown above to view its hierarchy"
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === "ar" ? "إضافة" : "Add"} {getConfig(addLevel).labelEn}
            </DialogTitle>
            <DialogDescription>
              {locale === "ar"
                ? "أدخل تفاصيل العنصر الجديد"
                : "Enter the details for the new item"
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{locale === "ar" ? "الاسم بالإنجليزية" : "English Name"}</Label>
              <Input
                value={formNameEn}
                onChange={(e) => setFormNameEn(e.target.value)}
                placeholder="Enter name in English"
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "الاسم بالعربية" : "Arabic Name"}</Label>
              <Input
                value={formNameAr}
                onChange={(e) => setFormNameAr(e.target.value)}
                placeholder="أدخل الاسم بالعربية"
                dir="rtl"
              />
            </div>
            {renderLevelFields()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={submitAdd}
              disabled={!formNameEn || !formNameAr || (addLevel === "Domain" && !formCode)}
            >
              {locale === "ar" ? "إضافة" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === "ar" ? "تعديل العنصر" : "Edit Item"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{locale === "ar" ? "الاسم بالإنجليزية" : "English Name"}</Label>
              <Input
                value={formNameEn}
                onChange={(e) => setFormNameEn(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{locale === "ar" ? "الاسم بالعربية" : "Arabic Name"}</Label>
              <Input
                value={formNameAr}
                onChange={(e) => setFormNameAr(e.target.value)}
                dir="rtl"
              />
            </div>
            {renderLevelFields()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={submitEdit}
              disabled={!formNameEn || !formNameAr || (addLevel === "Domain" && !formCode)}
            >
              {locale === "ar" ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {locale === "ar" ? "تأكيد الحذف" : "Confirm Delete"}
            </DialogTitle>
            <DialogDescription>
              {locale === "ar"
                ? "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to delete this item? This action cannot be undone."
              }
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="py-4 px-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="font-medium">{locale === "ar" ? selectedItem.nameAr : selectedItem.nameEn}</p>
              <p className="text-sm text-muted-foreground">{locale === "ar" ? selectedItem.nameEn : selectedItem.nameAr}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="destructive" onClick={submitDelete}>
              {locale === "ar" ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

