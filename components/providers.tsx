
"use client"

import * as React from "react"
import { LocaleProvider } from "@/lib/locale-context"
import { ThemeProvider } from "@/lib/theme-context"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <LocaleProvider>
                {children}
            </LocaleProvider>
        </ThemeProvider>
    )
}
