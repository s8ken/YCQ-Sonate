"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"

interface User {
  _id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  register: (name: string, email: string, password: string) => Promise<any>
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      // Load user data if token exists
      loadUser(storedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const loadUser = async (authToken: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.data)
      } else {
        // Token is invalid, clear it
        localStorage.removeItem("token")
        setToken(null)
        setError("Authentication failed. Please login again.")
      }
    } catch (err) {
      console.error("Error loading user:", err)
      localStorage.removeItem("token")
      setToken(null)
      setError("Authentication failed. Please login again.")
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.data.token)
        setUser(data.data.user)
        localStorage.setItem("token", data.data.token)
        return data
      } else {
        setError(data.message || "Registration failed")
        throw new Error(data.message || "Registration failed")
      }
    } catch (err: any) {
      setError(err.message || "Registration failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setToken(data.data.token)
        setUser(data.data.user)
        localStorage.setItem("token", data.data.token)
        return data
      } else {
        setError(data.message || "Login failed")
        throw new Error(data.message || "Login failed")
      }
    } catch (err: any) {
      setError(err.message || "Login failed")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem("token")
    }
  }

  const clearError = () => setError(null)

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
