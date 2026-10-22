import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    api('/auth/perfil')
      .then(setUsuario)
      .catch(() => setUsuario(null))
      .finally(() => setCarregando(false))
  }, [])

  async function atualizarUsuario() {
    const perfil = await api('/auth/perfil')
    setUsuario(perfil)
    return perfil
  }

  async function login(login, senha) {
    await api('/auth/login', { method: 'POST', body: { login, senha } })
    return atualizarUsuario()
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)