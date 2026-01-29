
"use client"

import * as React from "react"
import { LocaleProvider } from "@/lib/locale-context"
import { ThemeProvider } from "@/lib/theme-context"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/utils"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <LocaleProvider>
                <QueryClientProvider client={queryClient}>
                    {children}
                </QueryClientProvider>
            </LocaleProvider>
        </ThemeProvider>
    )
}
