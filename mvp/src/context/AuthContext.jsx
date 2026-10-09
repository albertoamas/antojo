import { createContext, use, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCargando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => setSession(nuevaSesion))
    return () => data.subscription.unsubscribe()
  }, [])

  const valor = useMemo(() => {
    const usuario = session?.user ?? null
    return {
      usuario,
      cargando,
      nombre: usuario?.user_metadata?.nombre || usuario?.email?.split('@')[0] || '',
      esAdmin: usuario?.app_metadata?.rol === 'admin',
    }
  }, [session, cargando])

  return <AuthContext value={valor}>{children}</AuthContext>
}

export function useAuth() {
  return use(AuthContext)
}
