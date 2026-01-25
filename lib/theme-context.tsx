
// "use client"

// import * as React from "react"

// export type Theme = "light" | "dark" | "system"

// interface ThemeContextType {
//     theme: Theme
//     resolvedTheme: "light" | "dark"
//     setTheme: (theme: Theme) => void
// }

// const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

// export function ThemeProvider({ children }: { children: React.ReactNode }) {
//     const [theme, setThemeState] = React.useState<Theme>("dark")
//     const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("dark")

//     React.useEffect(() => {
//         const savedTheme = localStorage.getItem("theme") as Theme | null
//         if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
//             setThemeState(savedTheme)
//         }
//     }, [])

//     React.useEffect(() => {
//         const root = document.documentElement

//         const applyTheme = (isDark: boolean) => {
//             if (isDark) {
//                 root.classList.add("dark")
//                 setResolvedTheme("dark")
//             } else {
//                 root.classList.remove("dark")
//                 setResolvedTheme("light")
//             }
//         }

//         if (theme === "system") {
//             const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
//             applyTheme(mediaQuery.matches)

//             const handler = (e: MediaQueryListEvent) => applyTheme(e.matches)
//             mediaQuery.addEventListener("change", handler)
//             return () => mediaQuery.removeEventListener("change", handler)
//         } else {
//             applyTheme(theme === "dark")
//         }

//         localStorage.setItem("theme", theme)
//     }, [theme])

//     const setTheme = React.useCallback((newTheme: Theme) => {
//         setThemeState(newTheme)
//     }, [])

//     return (
//         <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
//             {children}
//         </ThemeContext.Provider>
//     )
// }

// export function useTheme() {
//     const context = React.useContext(ThemeContext)
//     if (context === undefined) {
//         throw new Error("useTheme must be used within a ThemeProvider")
//     }
//     return context
// }

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
    children,
    ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}