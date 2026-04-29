import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../api'

interface AuthContextType {
  token: string | null
  parentName: string | null
  login: (token: string, name: string) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [parentName, setParentName] = useState<string | null>(localStorage.getItem('parent_name'))

  const login = (t: string, name: string) => {
    localStorage.setItem('token', t)
    localStorage.setItem('parent_name', name)
    setToken(t)
    setParentName(name)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('parent_name')
    setToken(null)
    setParentName(null)
  }

  return (
    <AuthContext.Provider value={{ token, parentName, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
