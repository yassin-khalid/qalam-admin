
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconEye, IconEyeOff, IconMoon, IconSun, IconCheck, IconX, IconWorld } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocale } from "@/lib/locale-context"
import { useTheme } from "@/lib/theme-context"
import { useAuth } from "@/lib/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useForm } from "@tanstack/react-form"
import { parseAsString } from "nuqs"
import { useQueryState } from "nuqs"
import z from "zod"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { ApiResponse } from "@/types/ApiResponse"
import Image from "next/image"

export default function RegisterPage() {
    const [firstName, setFirstName] = useQueryState("firstName", parseAsString.withDefault(""))
    const [lastName, setLastName] = useQueryState("lastName", parseAsString.withDefault(""))
    const [email, setEmail] = useQueryState("email", parseAsString.withDefault(""))
    const [phoneNumber, setPhoneNumber] = useQueryState("phoneNumber", parseAsString.withDefault(""))

    const { t, locale, setLocale, direction } = useLocale()
    const { theme, setTheme } = useTheme()
    const { login } = useAuth()
    const router = useRouter()

    const [formData, setFormData] = React.useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
    })
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [errors, setErrors] = React.useState<Record<string, string>>({})

    const passwordRequirements = [
        { key: "length", labelKey: "auth.pwdReqLength", test: (p: string) => p.length >= 8 },
        { key: "uppercase", labelKey: "auth.pwdReqUppercase", test: (p: string) => /[A-Z]/.test(p) },
        { key: "lowercase", labelKey: "auth.pwdReqLowercase", test: (p: string) => /[a-z]/.test(p) },
        { key: "number", labelKey: "auth.pwdReqNumber", test: (p: string) => /\d/.test(p) },
    ]



    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const validatePhone = (phone: string) => {
        return /^\+?[\d\s-]{10,}$/.test(phone)
    }

    const RegisterSchema = z.object({
        firstName: z.string().min(1, { error: t("auth.requiredField") }),
        lastName: z.string().min(1, { error: t("auth.requiredField") }),
        email: z.email({ error: t("auth.invalidEmail") }),
        phoneNumber: z.string().min(1, { error: t("auth.requiredField") }).refine((phone) => validatePhone(phone), { error: t("auth.invalidPhone") }),
        password: z.string().min(8, { error: t("auth.minPassword") }).refine((password) => passwordRequirements.some((req) => req.test(password)), { error: t("auth.passwordRequirements") }),
        confirmPassword: z.string().min(8, { error: t("auth.minPassword") }).refine((password) => passwordRequirements.some((req) => req.test(password)), { error: t("auth.passwordRequirements") }),
    }).refine((data) => data.password === data.confirmPassword, {
        error: t("auth.passwordMismatch"),
        path: ["confirmPassword"],
    })
    type RegisterData = z.infer<typeof RegisterSchema>

    const { mutateAsync } = useMutation({
        mutationFn: async (data: RegisterData) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Authentication/Register`, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept-Language": locale === "ar" ? "ar-EG" : "en-US",
                    "Accept": "application/json",
                },
                method: "POST",
                body: JSON.stringify(data),
            })
            const json: ApiResponse<{ message: string }> = await response.json()
            if (!json.succeeded) {
                throw new Error(json.message)
            }
            return json
        },
        onSuccess: ({ data }) => {
            // login(data.accessToken, { email: data.email, userName: data.userName, fullName: data.fullName })
            toast.success(data.message)
            router.push("/login")
        },
        onError: (error) => {
            toast.error(error.message)
        }
    })

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.firstName.trim()) {
            newErrors.firstName = t("auth.requiredField")
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = t("auth.requiredField")
        }

        if (!formData.email.trim()) {
            newErrors.email = t("auth.requiredField")
        } else if (!validateEmail(formData.email)) {
            newErrors.email = t("auth.invalidEmail")
        }

        if (!formData.password) {
            newErrors.password = t("auth.requiredField")
        } else if (formData.password.length < 8) {
            newErrors.password = t("auth.minPassword")
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = t("auth.requiredField")
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = t("auth.passwordMismatch")
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = t("auth.requiredField")
        } else if (!validatePhone(formData.phoneNumber)) {
            newErrors.phoneNumber = t("auth.invalidPhone")
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault()

    //     if (!validateForm()) return

    //     setIsLoading(true)

    //     // Simulate API call - replace with actual API integration
    //     try {
    //         await new Promise(resolve => setTimeout(resolve, 1500))

    //         // Mock successful registration response
    //         const mockUser = {
    //             id: 1,
    //             firstName: formData.firstName,
    //             lastName: formData.lastName,
    //             email: formData.email,
    //             phoneNumber: formData.phoneNumber,
    //         }
    //         const mockToken = "mock_access_token_" + Date.now()

    //         login(mockToken, mockUser)
    //         router.push("/")
    //     } catch {
    //         setErrors({ form: t("auth.registerError") })
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }))
        }
    }

    const form = useForm({
        defaultValues: {
            firstName: firstName || "",
            lastName: lastName || "",
            email: email || "",
            phoneNumber: phoneNumber || "",
            password: "",
            confirmPassword: "",
        },
        validators: {
            onChange: RegisterSchema,
        }
    })
    return (
        <div className="min-h-screen flex bg-background" dir={direction}>
            {/* Left Side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-12">
                <div className="max-w-md text-center space-y-6">
                    {/* <div className="h-24 w-24 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                        <IconSchool className="h-12 w-12 text-primary" />
                    </div> */}

                    <div className="h-24 w-24 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                        {theme === "dark" ? <Image src="/qalam-logo-dark.svg" alt="Qalam Logo" width={64} height={64} /> : <Image src="/qalam-logo.svg" alt="Qalam Logo" width={64} height={64} />}
                    </div>

                    <h2 className="text-2xl font-bold text-foreground text-balance">
                        {t("auth.joinTitle")}
                    </h2>
                    <p className="text-muted-foreground text-pretty">
                        {t("auth.joinDesc")}
                    </p>
                    <div className="space-y-3 text-start pt-6">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                            {/* <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <IconCheck className="h-5 w-5 text-primary" />
                            </div> */}
                            <div>
                                <div className="font-medium text-foreground">{t("auth.featureControl")}</div>
                                <div className="text-sm text-muted-foreground">{t("auth.featureControlDesc")}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <IconCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div className="font-medium text-foreground">{t("auth.featureTeachers")}</div>
                                <div className="text-sm text-muted-foreground">{t("auth.featureTeachersDesc")}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <IconCheck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <div className="font-medium text-foreground">{t("auth.featureMultilang")}</div>
                                <div className="text-sm text-muted-foreground">{t("auth.featureMultilangDesc")}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col">
                {/* Header with controls */}
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        {/* <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <IconSchool className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-foreground">EduAdmin</span> */}

                        <div></div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="inline-flex size-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                                <IconWorld className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setLocale("en")}>
                                    <span className={locale === "en" ? "font-semibold" : ""}>English</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setLocale("ar")}>
                                    <span className={locale === "ar" ? "font-semibold" : ""}>العربية</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? <IconSun className="h-4 w-4" /> : <IconMoon className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Form */}
                <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                    <Card className="w-full max-w-md border-border">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-bold">{t("auth.registerTitle")}</CardTitle>
                            <CardDescription>{t("auth.registerSubtitle")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                form.handleSubmit()
                            }}
                                className="space-y-4">
                                {errors.form && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                        {errors.form}
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <form.Field name="firstName">
                                        {(field) => {
                                            const invalid = field.state.meta.isTouched && field.state.meta.isValid === false
                                            return (
                                                <div className="space-y-2">
                                                    <Label htmlFor={field.name}>{t("auth.firstName")}</Label>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        type="text"
                                                        placeholder={t("auth.firstName")}
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        onBlur={field.handleBlur}
                                                        className={invalid ? "border-destructive" : ""}
                                                        disabled={isLoading}
                                                    />
                                                    {invalid && (
                                                        <p className="text-xs text-destructive">{field.state.meta.errors?.[0]?.message}</p>
                                                    )}
                                                </div>

                                            )
                                        }}
                                    </form.Field>
                                    <form.Field name="lastName">
                                        {(field) => {
                                            const invalid = field.state.meta.isTouched && field.state.meta.isValid === false
                                            return (
                                                <div className="space-y-2">
                                                    <Label htmlFor={field.name}>{t("auth.lastName")}</Label>
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        type="text"
                                                        placeholder={t("auth.lastName")}
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        onBlur={field.handleBlur}
                                                        className={invalid ? "border-destructive" : ""}
                                                        disabled={isLoading}
                                                    />
                                                    {invalid && (
                                                        <p className="text-xs text-destructive">{field.state.meta.errors?.[0]?.message}</p>
                                                    )}
                                                </div>
                                            )
                                        }}
                                    </form.Field>
                                </div>

                                <form.Field name="email">
                                    {(field) => {
                                        const invalid = field.state.meta.isTouched && field.state.meta.isValid === false
                                        return (
                                            <div className="space-y-2">
                                                <Label htmlFor={field.name}>{t("auth.email")}</Label>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    onBlur={field.handleBlur}
                                                    className={invalid ? "border-destructive" : ""}
                                                    disabled={isLoading}
                                                />
                                                {invalid && (
                                                    <p className="text-xs text-destructive">{field.state.meta.errors?.[0]?.message}</p>
                                                )}
                                            </div>

                                        )
                                    }}
                                </form.Field>
                                <form.Field name="phoneNumber">
                                    {(field) => {
                                        const invalid = field.state.meta.isTouched && field.state.meta.isValid === false
                                        return <div className="space-y-2">
                                            <Label htmlFor={field.name}>{t("auth.phoneNumber")}</Label>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="tel"
                                                placeholder="+966 5XX XXX XXXX"
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                onBlur={field.handleBlur}
                                                className={invalid ? "border-destructive" : ""}
                                                disabled={isLoading}
                                                dir="ltr"
                                            />
                                            {invalid && (
                                                <p className="text-xs text-destructive">{field.state.meta.errors?.[0]?.message}</p>
                                            )}
                                        </div>

                                    }}
                                </form.Field>

                                <form.Field name="password">
                                    {(field) => {
                                        const invalid = field.state.meta.isTouched && field.state.meta.isValid === false
                                        return (
                                            <div className="space-y-2">
                                                <Label htmlFor="password">{t("auth.password")}</Label>
                                                <div className="relative">
                                                    <Input
                                                        id={field.name}
                                                        name={field.name}
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder={t("auth.password")}
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        onBlur={field.handleBlur}
                                                        className={invalid ? "border-destructive" : ""}
                                                        disabled={isLoading}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-0 h-full px-3 end-0"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        disabled={isLoading}
                                                    >
                                                        {showPassword ? (
                                                            <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <IconEye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {invalid && (
                                                    <p className="text-xs text-destructive">{field.state.meta.errors?.[0]?.message}</p>
                                                )}

                                                {/* Password requirements */}
                                                {field.state.meta.isTouched && (
                                                    <div className="grid grid-cols-2 gap-1 pt-1">
                                                        {passwordRequirements.map((req) => (
                                                            <div key={req.key} className="flex items-center gap-1 text-xs">
                                                                {req.test(field.state.value) ? (
                                                                    <IconCheck className="h-3 w-3 text-success" />
                                                                ) : (
                                                                    <IconX className="h-3 w-3 text-muted-foreground" />
                                                                )}
                                                                <span className={req.test(field.state.value) ? "text-success" : "text-muted-foreground"}>
                                                                    {t(req.labelKey)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }}
                                </form.Field>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder={t("auth.confirmPassword")}
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className={errors.confirmPassword ? "border-destructive" : ""}
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-0 h-full px-3 end-0"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={isLoading}
                                        >
                                            {showConfirmPassword ? (
                                                <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <IconEye className="h-4 w-4 text-muted-foreground" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? t("auth.registering") : t("auth.registerButton")}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    {t("auth.haveAccount")}{" "}
                                    <Link href="/login" className="text-primary hover:underline font-medium">
                                        {t("auth.login")}
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}
