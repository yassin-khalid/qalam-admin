
"use client"

import * as React from "react"
import { LocaleProvider } from "@/lib/locale-context"
import { ThemeProvider } from "@/lib/theme-context"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/utils"
import { AuthProvider, ProtectedRoute } from "@/lib/auth-context"
import { NuqsAdapter } from "nuqs/adapters/next/app"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <LocaleProvider>
                <AuthProvider>
                    <ProtectedRoute>
                        <QueryClientProvider client={queryClient}>
                            <NuqsAdapter>
                                {children}
                            </NuqsAdapter>
                        </QueryClientProvider>
                    </ProtectedRoute>
                </AuthProvider>
            </LocaleProvider >
        </ThemeProvider >
    )
}
