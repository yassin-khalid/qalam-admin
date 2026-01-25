
"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Save, Globe, Bell, Shield, Database, Palette, Sun, Moon, Monitor } from "@tabler/icons-react"
import { useLocale } from "@/lib/locale-context"
import { useTheme, Theme } from "@/lib/theme-context"

export default function SettingsPage() {
    const { t, locale, setLocale } = useLocale()
    const { theme, setTheme } = useTheme()

    const [settings, setSettings] = React.useState({
        siteName: "EduAdmin",
        siteNameAr: "المنظومة التعليمية",
        emailNotifications: true,
        pushNotifications: false,
        weeklyReports: true,
        twoFactorAuth: false,
        sessionTimeout: "30",
        autoBackup: true,
        backupFrequency: "daily",
    })

    const handleSave = () => {
        console.log("Saving settings:", settings)
    }

    return (
        <AdminLayout
            breadcrumbs={[
                { label: t("nav.dashboard"), href: "/" },
                { label: t("nav.settings") },
            ]}
        >
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>
                        <p className="text-muted-foreground">{t("settings.subtitle")}</p>
                    </div>
                    <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                        <Save className="me-2 h-4 w-4" />
                        {t("common.save")}
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Language & Layout */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                                    <Globe className="h-5 w-5 text-chart-1" />
                                </div>
                                <div>
                                    <CardTitle className="text-foreground">{t("settings.language")}</CardTitle>
                                    <CardDescription>{t("settings.languageDesc")}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground">{t("domains.nameEn")}</Label>
                                <Input
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                                    className="bg-secondary border-0"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">{t("domains.nameAr")}</Label>
                                <Input
                                    value={settings.siteNameAr}
                                    onChange={(e) => setSettings({ ...settings, siteNameAr: e.target.value })}
                                    className="bg-secondary border-0"
                                    dir="rtl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">{t("settings.language")}</Label>
                                <Select
                                    value={locale}
                                    onValueChange={(value: "en" | "ar") => setLocale(value)}
                                >
                                    <SelectTrigger className="bg-secondary border-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="ar">العربية</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {locale === "ar"
                                        ? "سيتم تطبيق تخطيط RTL تلقائياً للعربية"
                                        : "RTL layout will be applied automatically for Arabic"
                                    }
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Appearance */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-5/10">
                                    <Palette className="h-5 w-5 text-chart-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-foreground">{t("settings.appearance")}</CardTitle>
                                    <CardDescription>{t("settings.appearanceDesc")}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground">{t("settings.theme")}</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant="outline"
                                        className={`flex flex-col items-center gap-2 h-auto py-4 ${theme === "light"
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-transparent border-border"
                                            }`}
                                        onClick={() => setTheme("light")}
                                    >
                                        <Sun className="h-5 w-5" />
                                        <span className="text-xs">{t("settings.light")}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className={`flex flex-col items-center gap-2 h-auto py-4 ${theme === "dark"
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-transparent border-border"
                                            }`}
                                        onClick={() => setTheme("dark")}
                                    >
                                        <Moon className="h-5 w-5" />
                                        <span className="text-xs">{t("settings.dark")}</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className={`flex flex-col items-center gap-2 h-auto py-4 ${theme === "system"
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-transparent border-border"
                                            }`}
                                        onClick={() => setTheme("system")}
                                    >
                                        <Monitor className="h-5 w-5" />
                                        <span className="text-xs">{t("settings.system")}</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                                    <Bell className="h-5 w-5 text-chart-2" />
                                </div>
                                <div>
                                    <CardTitle className="text-foreground">{t("settings.notifications")}</CardTitle>
                                    <CardDescription>{t("settings.notificationsDesc")}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                                <div>
                                    <Label className="text-foreground">
                                        {locale === "ar" ? "إشعارات البريد الإلكتروني" : "Email Notifications"}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {locale === "ar" ? "تلقي التحديثات عبر البريد" : "Receive updates via email"}
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.emailNotifications}
                                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                                <div>
                                    <Label className="text-foreground">
                                        {locale === "ar" ? "إشعارات المتصفح" : "Push Notifications"}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {locale === "ar" ? "إشعارات فورية في المتصفح" : "Browser push notifications"}
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.pushNotifications}
                                    onCheckedChange={(checked) => setSettings({ ...settings, pushNotifications: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                                <div>
                                    <Label className="text-foreground">
                                        {locale === "ar" ? "التقارير الأسبوعية" : "Weekly Reports"}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {locale === "ar" ? "تلقي تقارير أسبوعية" : "Receive weekly summary reports"}
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.weeklyReports}
                                    onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security */}
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                                    <Shield className="h-5 w-5 text-chart-3" />
                                </div>
                                <div>
                                    <CardTitle className="text-foreground">{t("settings.security")}</CardTitle>
                                    <CardDescription>{t("settings.securityDesc")}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                                <div>
                                    <Label className="text-foreground">
                                        {locale === "ar" ? "المصادقة الثنائية" : "Two-Factor Authentication"}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {locale === "ar" ? "طبقة أمان إضافية" : "Add extra security layer"}
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.twoFactorAuth}
                                    onCheckedChange={(checked) => setSettings({ ...settings, twoFactorAuth: checked })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground">
                                    {locale === "ar" ? "مهلة الجلسة (بالدقائق)" : "Session Timeout (minutes)"}
                                </Label>
                                <Select
                                    value={settings.sessionTimeout}
                                    onValueChange={(value) => setSettings({ ...settings, sessionTimeout: value })}
                                >
                                    <SelectTrigger className="bg-secondary border-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">{locale === "ar" ? "15 دقيقة" : "15 minutes"}</SelectItem>
                                        <SelectItem value="30">{locale === "ar" ? "30 دقيقة" : "30 minutes"}</SelectItem>
                                        <SelectItem value="60">{locale === "ar" ? "ساعة واحدة" : "1 hour"}</SelectItem>
                                        <SelectItem value="120">{locale === "ar" ? "ساعتان" : "2 hours"}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data & Backup */}
                    <Card className="bg-card border-border lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                                    <Database className="h-5 w-5 text-chart-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-foreground">{t("settings.backup")}</CardTitle>
                                    <CardDescription>{t("settings.backupDesc")}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
                                    <div>
                                        <Label className="text-foreground">
                                            {locale === "ar" ? "النسخ الاحتياطي التلقائي" : "Automatic Backup"}
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            {locale === "ar" ? "تفعيل النسخ الاحتياطي التلقائي" : "Enable automatic data backup"}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings.autoBackup}
                                        onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        {locale === "ar" ? "تكرار النسخ الاحتياطي" : "Backup Frequency"}
                                    </Label>
                                    <Select
                                        value={settings.backupFrequency}
                                        onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
                                    >
                                        <SelectTrigger className="bg-secondary border-0">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hourly">{locale === "ar" ? "كل ساعة" : "Hourly"}</SelectItem>
                                            <SelectItem value="daily">{locale === "ar" ? "يومياً" : "Daily"}</SelectItem>
                                            <SelectItem value="weekly">{locale === "ar" ? "أسبوعياً" : "Weekly"}</SelectItem>
                                            <SelectItem value="monthly">{locale === "ar" ? "شهرياً" : "Monthly"}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <Button variant="outline" className="flex-1 bg-transparent border-border">
                                    {locale === "ar" ? "تنزيل النسخة الاحتياطية" : "Download Backup"}
                                </Button>
                                <Button variant="outline" className="flex-1 bg-transparent border-border">
                                    {locale === "ar" ? "استعادة من نسخة" : "Restore Backup"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    )
}
