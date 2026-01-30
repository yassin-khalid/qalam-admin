"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { IconEye, IconEyeOff, IconMoon, IconSun, IconWorld } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useLocale } from "@/lib/locale-context"
import { useTheme } from "@/lib/theme-context"
import { useAuth } from "@/lib/auth-context"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { useForm, useStore } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { ApiResponse } from "@/types/ApiResponse"
import { z } from "zod"
import { parseAsString, useQueryState } from "nuqs"
import { toast } from "sonner"

type LoginData = {
    accessToken: string,
    refreshToken: {
        userName: string,
        tokenString: string,
        expireAt: string
    },
    userName: string,
    email: string,
    fullName: string
}



type LoginForm = { userNameOrEmail: string; password: string }

export default function LoginPage() {
    const [userNameOrEmail, setUserNameOrEmail] = useQueryState('userNameOrEmail', parseAsString.withDefault(''))

    const { t, locale, setLocale, direction } = useLocale()
    const { theme, setTheme } = useTheme()
    const { login } = useAuth()
    const router = useRouter()

    // const [formData, setFormData] = React.useState({
    //     userNameOrEmail: "",
    //     password: "",
    // })
    const [showPassword, setShowPassword] = React.useState(false)
    const [rememberMe, setRememberMe] = React.useState(false)
    // const [isLoading, setIsLoading] = React.useState(false)
    // const [errors, setErrors] = React.useState<Record<string, string>>({})

    // const validateForm = () => {
    //     const newErrors: Record<string, string> = {}

    //     if (!formData.userNameOrEmail.trim()) {
    //         newErrors.userNameOrEmail = t("auth.requiredField")
    //     }

    //     if (!formData.password) {
    //         newErrors.password = t("auth.requiredField")
    //     }

    //     setErrors(newErrors)
    //     return Object.keys(newErrors).length === 0
    // }

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault()

    //     if (!validateForm()) return

    //     setIsLoading(true)

    //     // Simulate API call - replace with actual API integration
    //     try {
    //         await new Promise(resolve => setTimeout(resolve, 1500))

    //         // Mock successful login response
    //         const mockUser = {
    //             id: 1,
    //             firstName: "Admin",
    //             lastName: "User",
    //             email: formData.userNameOrEmail,
    //             phoneNumber: "+966500000000",
    //         }
    //         const mockToken = "mock_access_token_" + Date.now()

    //         login(mockToken, mockUser)
    //         router.push("/")
    //     } catch {
    //         setErrors({ form: t("auth.loginError") })
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    const loginSchema = z.object({
        userNameOrEmail: z.email({ error: t("auth.invalidEmail") }),
        password: z.string().min(8, { message: t("auth.minPassword") }),
    })

    const { mutateAsync } = useMutation({
        mutationFn: async (loginData: LoginForm) => {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/Api/V1/Authentication/Login`, {
                method: "POST",
                body: JSON.stringify(loginData),
                headers: {
                    "Content-Type": "application/json",
                    "Accept-Language": locale === "ar" ? "ar-EG" : "en-US",
                    "Accept": "application/json",
                },
            })
            const data: ApiResponse<LoginData> = await response.json()
            if (!data.succeeded) {
                throw new Error(data.message)
            }
            return data
        },
        onSuccess: ({ data, message }) => {
            login(data.accessToken, { email: data.email, userName: data.userName, fullName: data.fullName })
            // toast.success(t("auth.loginSuccess"))
            toast.success(message)
            router.push("/")
        },
        onError: (error) => {
            toast.error(error.message)
            // setErrors({ form: t("auth.loginError") })


        }
    })

    const form = useForm({
        defaultValues: {
            userNameOrEmail: userNameOrEmail || "",
            password: "",
        },
        validators: {

            onChange: loginSchema,
        },
        onSubmit: async ({ value }) => {
            await mutateAsync(value)
        },
    })

    const isSubmitting = useStore(form.store, (form) => form.isSubmitting)

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { name, value } = e.target
    //     setFormData(prev => ({ ...prev, [name]: value }))
    //     if (errors[name]) {
    //         setErrors(prev => ({ ...prev, [name]: "" }))
    //     }
    // }

    return (
        <div className="min-h-screen flex bg-background" dir={direction}>
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col">
                {/* Header with controls */}
                <div className="flex items-center justify-between p-4">
                    <div></div>
                    {/* <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-transparent flex items-center justify-center">
                            {theme === "dark" ? <Image src="/qalam-logo-dark.svg" alt="Qalam" width={32} height={32} /> : <Image src="/qalam-logo.svg" alt="Qalam" width={32} height={32} />}
                        </div>
                        <span className="font-semibold text-foreground">{t("auth.platformTitle")}</span>
                    </div> */}

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
                <div className="flex-1 flex items-center justify-center p-6">
                    <Card className="w-full max-w-md border-border">
                        <CardHeader className="space-y-1 text-center">
                            <CardTitle className="text-2xl font-bold">{t("auth.loginTitle")}</CardTitle>
                            <CardDescription>{t("auth.loginSubtitle")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                form.handleSubmit()
                            }}
                                className="space-y-4">
                                {/* {errors.form && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                                        {errors.form}
                                    </div>
                                )} */}

                                <form.Field name="userNameOrEmail">
                                    {(field) => {
                                        const invalid = field.state.meta.isTouched && field.state.meta.isValid === false
                                        return (
                                            <div className="space-y-2">
                                                <Label htmlFor="userNameOrEmail">{t("auth.userNameOrEmail")}</Label>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="text"
                                                    placeholder={t("auth.userNameOrEmail")}
                                                    value={field.state.value}
                                                    onChange={e => {
                                                        field.handleChange(e.target.value);
                                                        setUserNameOrEmail(e.target.value || "")
                                                    }}
                                                    onBlur={field.handleBlur}
                                                    className={invalid ? "border-destructive" : ""}
                                                    disabled={isSubmitting}
                                                />
                                                {invalid && (
                                                    <p className="text-xs text-destructive">{field.state.meta.errors?.[0]?.message || ""}</p>
                                                )}
                                            </div>
                                        )
                                    }}
                                </form.Field>

                                <form.Field name="password" >
                                    {(field) => {
                                        const invalid = field.state.meta.isTouched && field.state.meta.isValid === false
                                        return <div className="space-y-2">
                                            <Label htmlFor="password">{t("auth.password")}</Label>
                                            <div className="relative">
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder={t("auth.password")}
                                                    value={field.state.value}
                                                    onChange={e => field.handleChange(e.target.value)}
                                                    onBlur={field.handleBlur}
                                                    className={invalid ? "border-destructive" : ""}
                                                    disabled={isSubmitting}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-0 h-full px-3 end-0"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    disabled={isSubmitting}
                                                >
                                                    {showPassword ? (
                                                        <IconEyeOff className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <IconEye className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </div>
                                            {invalid && (
                                                <p className="text-xs text-destructive">{field.state.meta.errors?.[0]?.message || ""}</p>
                                            )}
                                        </div>
                                    }}
                                </form.Field>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Checkbox
                                            id="rememberMe"
                                            checked={rememberMe}
                                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                            disabled={isSubmitting}
                                        />
                                        <Label htmlFor="rememberMe" className="text-sm font-normal cursor-pointer">
                                            {t("auth.rememberMe")}
                                        </Label>
                                    </div>
                                    <Button variant="link" className="px-0 h-auto font-normal text-primary">
                                        {t("auth.forgotPassword")}
                                    </Button>
                                </div>

                                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                                    {([canSubmit, isSubmitting]) => (
                                        <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
                                            {isSubmitting ? t("auth.loggingIn") : t("auth.loginButton")}
                                        </Button>
                                    )}
                                </form.Subscribe>

                                <p className="text-center text-sm text-muted-foreground">
                                    {t("auth.noAccount")}{" "}
                                    <Link href="/register" className="text-primary hover:underline font-medium">
                                        {t("auth.register")}
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Right Side - Decorative */}
            <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-12">
                <div className="max-w-md text-center space-y-6">
                    <div className="h-24 w-24 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                        {/* <IconSchool className="h-12 w-12 text-primary" /> */}
                        {theme === "dark" ? <Image src="/qalam-logo-dark.svg" alt="Qalam" width={64} height={64} /> : <Image src="/qalam-logo.svg" alt="Qalam" width={64} height={64} />}
                    </div>
                    <h2 className="text-2xl font-bold text-foreground text-balance">
                        {t("auth.platformTitle")}
                    </h2>
                    <p className="text-muted-foreground text-pretty">
                        {t("auth.platformDesc")}
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-6">
                        <div className="p-4 rounded-lg bg-card border border-border">
                            <div className="text-2xl font-bold text-primary">12K+</div>
                            <div className="text-sm text-muted-foreground">{t("auth.statLessons")}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-border">
                            <div className="text-2xl font-bold text-primary">248</div>
                            <div className="text-sm text-muted-foreground">{t("auth.statTeachers")}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-border">
                            <div className="text-2xl font-bold text-primary">48</div>
                            <div className="text-sm text-muted-foreground">{t("auth.statCurriculums")}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-border">
                            <div className="text-2xl font-bold text-primary">12</div>
                            <div className="text-sm text-muted-foreground">{t("auth.statDomains")}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
