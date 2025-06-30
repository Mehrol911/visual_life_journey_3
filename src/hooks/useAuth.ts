import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, signUp, signIn, signOut, getCurrentUser, onAuthStateChange } from '../lib/supabase'
import { User } from '../types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    getCurrentUser().then(({ user, error }) => {
      if (error) {
        console.error('Error getting user:', error)
        setError(error.message)
      } else if (user) {
        setUser(transformSupabaseUser(user))
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(transformSupabaseUser(session.user))
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const transformSupabaseUser = (supabaseUser: SupabaseUser): User => {
    const metadata = supabaseUser.user_metadata || {}
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      full_name: metadata.full_name || metadata.name || '',
      birth_date: metadata.birth_date || metadata.birthDate || '',
      profession: {
        id: metadata.profession_id || 'doctor',
        name: metadata.profession_name || 'Doctor',
        theme: metadata.profession_theme || {
          name: 'Doctor',
          colors: {
            primary: '#0066CC',
            secondary: '#4A90E2',
            accent: '#00A8CC',
            background: '#ffffff',
            text: '#1f2937',
            success: '#059669',
            warning: '#d97706',
            error: '#dc2626',
          },
          gradients: {
            primary: 'linear-gradient(135deg, #0066CC 0%, #4A90E2 100%)',
            secondary: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          },
          quote: "Healing is a matter of time, but it is sometimes also a matter of opportunity.",
          description: "Dedicated to healing and caring for others, making every day count in service to humanity."
        }
      },
      created_at: supabaseUser.created_at || new Date().toISOString(),
      updated_at: supabaseUser.updated_at || new Date().toISOString()
    }
  }

  const register = async (email: string, password: string, userData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await signUp(email, password, {
        full_name: userData.name,
        birth_date: userData.birthDate,
        profession_id: userData.profession.name.toLowerCase(),
        profession_name: userData.profession.name,
        profession_theme: userData.profession
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await signOut()
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(null)
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (profileData: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          birth_date: profileData.birthDate,
          profession_id: profileData.profession.name.toLowerCase(),
          profession_name: profileData.profession.name,
          profession_theme: profileData.profession
        }
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      if (data.user) {
        setUser(transformSupabaseUser(data.user))
      }

      return { success: true, data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile
  }
}