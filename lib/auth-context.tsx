
"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
    userName: string,
    email: string,
    fullName: string
}

interface AuthContextType {
    user: User | null
    token: string | null
    isLoading: boolean
    isAuthenticated: boolean
    login: (token: string, user: User) => void
    logout: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

const PUBLIC_ROUTES = ["/login", "/register"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = React.useState<User | null>(null)
    const [token, setToken] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const router = useRouter()
    const pathname = usePathname()

    // Load auth state from localStorage on mount
    React.useEffect(() => {
        const savedToken = localStorage.getItem("access_token")
        const savedUser = localStorage.getItem("user")

        if (savedToken && savedUser) {
            try {
                setToken(savedToken)
                setUser(JSON.parse(savedUser))
            } catch {
                localStorage.removeItem("access_token")
                localStorage.removeItem("user")
            }
        }
        setIsLoading(false)
    }, [])

    // Redirect based on auth state
    React.useEffect(() => {
        if (isLoading) return

        const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
        const isAuthenticated = !!token

        if (!isAuthenticated && !isPublicRoute) {
            router.push("/login")
        } else if (isAuthenticated && isPublicRoute) {
            router.push("/")
        }
    }, [token, pathname, isLoading, router])

    const login = React.useCallback((newToken: string, newUser: User) => {
        localStorage.setItem("access_token", newToken)
        localStorage.setItem("user", JSON.stringify(newUser))
        setToken(newToken)
        setUser(newUser)
    }, [])

    const logout = React.useCallback(() => {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
        setToken(null)
        setUser(null)
        router.push("/login")
    }, [router])

    const isAuthenticated = !!token

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth()
    const pathname = usePathname()

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

    if (!isAuthenticated && !isPublicRoute) {
        return null
    }

    return <>{children}</>
}
