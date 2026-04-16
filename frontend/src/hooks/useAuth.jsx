import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    try {
      const data = await authAPI.me()
      setUser(data)
    } catch {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (username, password) => {
    const data = await authAPI.login(username, password)
    localStorage.setItem('token', data.token)
    setUser({ username: data.username, balance: data.balance, vip_level: data.vip_level, is_admin: data.is_admin })
    return data
  }

  const register = async (username, password) => {
    const data = await authAPI.register(username, password)
    localStorage.setItem('token', data.token)
    setUser({ username: data.username, balance: data.balance, vip_level: 0 })
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateBalance = (balance) => {
    setUser(prev => prev ? { ...prev, balance } : prev)
  }

  const refreshUser = fetchMe

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateBalance, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
