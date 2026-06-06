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
type HierarchyLevel = "Domain" | "Curriculum" | "Level" | "Grade" | "Subject" | "Term" | "Unit"

interface Option {
  id: number
  nameEn: string
  nameAr: string
  code: string | null
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
]

const getConfig = (level: HierarchyLevel) => levelConfigs.find(c => c.key === level) || levelConfigs[0]

// Get parent level for a given level
const getParentLevel = (level: HierarchyLevel): HierarchyLevel | null => {
  const hierarchy: HierarchyLevel[] = ["Domain", "Curriculum", "Level", "Grade", "Subject", "Term", "Unit"]
  const index = hierarchy.indexOf(level)
  return index > 0 ? hierarchy[index - 1] : null
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
  // Quran-only (ignored by the API for other domains)
  UnitTypeCode?: UnitTypeCode
  PageNumber?: number
  PageSize?: number
}

async function fetchHierarchy(params: FilterParams): Promise<{ data: HierarchyData }> {
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
    } catch (error) {
      console.error("Failed to load hierarchy:", error)
    } finally {
      setHierarchyLoading(false)
    }
  }, [])

  // Build filter params from breadcrumb. For Quran, inject unit-type + pagination
  // (overrides let callers pass fresh values without waiting on async state updates).
  const buildFilterParams = (
    items: BreadcrumbItem[],
    domain: Domain,
    quranOverrides?: { unitType?: UnitTypeCode; page?: number }
  ): FilterParams => {
    const params: FilterParams = { DomainId: domain.id }

    for (const item of items) {
      switch (item.level) {
        case "Curriculum": params.CurriculumId = item.id; break
        case "Level": params.LevelId = item.id; break
        case "Grade": params.GradeId = item.id; break
        case "Subject": params.SubjectId = item.id; break
        case "Term": params.TermIds = item.ids || [item.id]; break
      }
    }

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

  // Navigate to breadcrumb index
  const handleNavigate = (index: number) => {
    if (!selectedDomain) return

    if (index < 0) {
      // Back to domain view
      setBreadcrumb([])
      setSelectedTerms([])
      setIsTermSelectMode(false)
      setPageNumber(1)
      loadHierarchy(buildFilterParams([], selectedDomain, { unitType: quranUnitType, page: 1 }))
      return
    }

    const newBreadcrumbs = breadcrumb.slice(0, index + 1)
    setBreadcrumb(newBreadcrumbs)
    setSelectedTerms([])

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
    setShowAddDialog(true)
  }

  // Handle edit item
  const handleEdit = (level: HierarchyLevel | null, item: Option) => {
    if (!level) return
    setAddLevel(level)
    setSelectedItem(item)
    setFormNameEn(item.nameEn)
    setFormNameAr(item.nameAr)
    setFormIsActive(true)
    setShowEditDialog(true)
  }

  // Handle delete item
  const handleDelete = (item: Option) => {
    setSelectedItem(item)
    setShowDeleteDialog(true)
  }

  // Submit add form
  const submitAdd = async () => {
    const parentLevel = getParentLevel(addLevel)
    let url = `${process.env.NEXT_PUBLIC_API_URL}`

    // Build the payload with parentId
    const payload: Record<string, unknown> = {
      nameEn: formNameEn,
      nameAr: formNameAr,
      isActive: formIsActive,
    }

    // Add parent reference based on level
    if (parentLevel === "Domain" || addLevel === "Curriculum") {
      payload.domainId = selectedDomain?.id
    }
    if (addLevel === "Level") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
    }
    if (addLevel === "Grade") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
      payload.levelId = breadcrumb.find(b => b.level === "Level")?.id
    }
    if (addLevel === "Subject") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
      payload.levelId = breadcrumb.find(b => b.level === "Level")?.id
      payload.gradeId = breadcrumb.find(b => b.level === "Grade")?.id
    }
    if (addLevel === "Term") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
      payload.levelId = breadcrumb.find(b => b.level === "Level")?.id
      payload.gradeId = breadcrumb.find(b => b.level === "Grade")?.id
      payload.subjectId = breadcrumb.find(b => b.level === "Subject")?.id
    }
    if (addLevel === "Unit") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
      payload.levelId = breadcrumb.find(b => b.level === "Level")?.id
      payload.gradeId = breadcrumb.find(b => b.level === "Grade")?.id
      payload.subjectId = breadcrumb.find(b => b.level === "Subject")?.id
      payload.termIds = breadcrumb.find(b => b.level === "Term")?.ids
    }

    switch (addLevel) {
      case "Domain":
        url += `/Api/V1/Education/Domains`
        break
      case "Curriculum":
        url += `/Api/V1/Education/Curriculums`
        break
      case "Level":
        url += `/Api/V1/Education/Levels`
        break
      case "Grade":
        url += `/Api/V1/Education/Grades`
        break
      case "Subject":
        url += `/Api/V1/Subjects`
        break
      case "Term":
        url += `/Api/V1/Education/Terms`
        break
      case "Unit":
        url += `/Api/V1/Content/Units`
        break
    }
    // TODO: Call real API with payload
    // console.log("Adding:", { level: addLevel, payload })
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
    const json: ApiResponse<any> = await response.json()
    if (!json.succeeded) {
      toast.error(json.message)
      return
    }
    toast.success(json.message)
    setShowAddDialog(false)

    // Refresh data
    if (selectedDomain) {
      const params = buildFilterParams(breadcrumb, selectedDomain)
      loadHierarchy(params)
    }
  }

  // Submit edit form
  const submitEdit = async () => {
    if (!selectedItem || !addLevel) return
    const parentLevel = getParentLevel(addLevel)
    let url = `${process.env.NEXT_PUBLIC_API_URL}`

    // Build the payload with parentId
    const payload: Record<string, unknown> = {
      nameEn: formNameEn,
      nameAr: formNameAr,
      isActive: formIsActive,
    }

    // Add parent reference based on level
    if (parentLevel === "Domain" || addLevel === "Curriculum") {
      payload.domainId = selectedDomain?.id
    }
    if (addLevel === "Level") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
    }
    if (addLevel === "Grade") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
      payload.levelId = breadcrumb.find(b => b.level === "Level")?.id
    }
    if (addLevel === "Subject") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
      payload.levelId = breadcrumb.find(b => b.level === "Level")?.id
      payload.gradeId = breadcrumb.find(b => b.level === "Grade")?.id
    }
    if (addLevel === "Term") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
      payload.levelId = breadcrumb.find(b => b.level === "Level")?.id
      payload.gradeId = breadcrumb.find(b => b.level === "Grade")?.id
      payload.subjectId = breadcrumb.find(b => b.level === "Subject")?.id
    }
    if (addLevel === "Unit") {
      payload.domainId = selectedDomain?.id
      payload.curriculumId = breadcrumb.find(b => b.level === "Curriculum")?.id
      payload.levelId = breadcrumb.find(b => b.level === "Level")?.id
      payload.gradeId = breadcrumb.find(b => b.level === "Grade")?.id
      payload.subjectId = breadcrumb.find(b => b.level === "Subject")?.id
      payload.termIds = breadcrumb.find(b => b.level === "Term")?.ids
    }


    switch (addLevel) {
      case "Domain":
        url += `/Api/V1/Education/Domains/${selectedItem.id}`
        break
      case "Curriculum":
        url += `/Api/V1/Education/Curriculums/${selectedItem.id}`
        break
      case "Level":
        url += `/Api/V1/Education/Levels/${selectedItem.id}`
        break
      case "Grade":
        url += `/Api/V1/Education/Grades/${selectedItem.id}`
        break
      case "Subject":
        url += `/Api/V1/Subjects/${selectedItem.id}`
        break
      case "Term":
        url += `/Api/V1/Education/Terms/${selectedItem.id}`
        break
      case "Unit":
        url += `/Api/V1/Content/Units/${selectedItem.id}`
        break
    }
    // TODO: Call real API with payload
    // console.log("Editing:", payload)
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
    const json: ApiResponse<any> = await response.json()
    if (!json.succeeded) {
      toast.error(json.message)
      return
    }
    toast.success(json.message)
    setShowEditDialog(false)

    // Refresh data
    if (selectedDomain) {
      const params = buildFilterParams(breadcrumb, selectedDomain)
      loadHierarchy(params)
    }
  }

  // Submit delete
  const submitDelete = async () => {

    if (!selectedItem || !hierarchyData) return

    const currentLevel = hierarchyData.nextStep as HierarchyLevel
    let url = `${process.env.NEXT_PUBLIC_API_URL}`
    switch (currentLevel) {
      case "Domain":
        url += `/Api/V1/Education/Domains/${selectedItem.id}`
        break
      case "Curriculum":
        url += `/Api/V1/Education/Curriculums/${selectedItem.id}`
        break
      case "Level":
        url += `/Api/V1/Education/Levels/${selectedItem.id}`
        break
      case "Grade":
        url += `/Api/V1/Education/Grades/${selectedItem.id}`
        break
      case "Subject":
        url += `/Api/V1/Subjects/${selectedItem.id}`
        break
      case "Term":
        url += `/Api/V1/Education/Terms/${selectedItem.id}`
        break
      case "Unit":
        url += `/Api/V1/Content/Units/${selectedItem.id}`
        break
    }
    // console.log("Deleting:", selectedItem?.id)
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
        "Accept": "application/json",
        "Accept-Language": locale === "ar" ? "ar-EG" : "en-US",
      },
    })
    const json: ApiResponse<any> = await response.json()
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
    const isUnit = level === "Unit"

    return (
      <div
        key={option.id}
        onClick={() => !isUnit && handleSelectOption(option, level)}
        className={cn(
          "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
          isTermSelected
            ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
            : "bg-card/50 border-border/30 hover:border-primary/30 hover:bg-card",
          !isUnit && "cursor-pointer",
          isUnit && "cursor-default"
        )}
      >
        {/* Checkbox for terms */}
        {isTermSelectMode && level === "Term" && (
          <div className="shrink-0">
            {isTermSelected ? (
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

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        </div>

        {/* Arrow for non-unit items */}
        {!isUnit && !isTermSelectMode && (
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

                    {/* Add button */}
                    {hierarchyData && (
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

                {/* Options list */}
                {hierarchyLoading ? (
                  renderSkeleton()
                ) : (
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
            <div className="flex items-center justify-between">
              <Label>{locale === "ar" ? "نشط" : "Active"}</Label>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={submitAdd} disabled={!formNameEn || !formNameAr}>
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
            <div className="flex items-center justify-between">
              <Label>{locale === "ar" ? "نشط" : "Active"}</Label>
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={submitEdit}>
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

