import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, signUp, signIn, signOut, getCurrentUser, onAuthStateChange } from '../lib/supabase'
import { User } from '../types'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Get initial session with better error handling
    const initializeAuth = async () => {
      try {
        const { user: currentUser, error: userError } = await getCurrentUser()
        
        if (!mounted) return

        if (userError) {
          console.error('Error getting user:', userError)
          // Don't set error for session missing - this is normal for logged out users
          if (userError.message !== 'Auth session missing!') {
            setError(userError.message)
          }
        } else if (currentUser) {
          // Only set user if they have confirmed their email (when confirmation is enabled)
          if (currentUser.email_confirmed_at || !currentUser.email) {
            setUser(transformSupabaseUser(currentUser))
          } else {
            // User exists but email not confirmed
            console.log('User email not confirmed yet')
            setUser(null)
          }
        }
      } catch (err) {
        if (!mounted) return
        console.error('Auth initialization error:', err)
        // Don't show error to user for initialization failures
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes with improved handling
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('Auth state change:', event, session?.user?.email)

      try {
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if email is confirmed (when confirmation is enabled)
          if (session.user.email_confirmed_at || !session.user.email) {
            setUser(transformSupabaseUser(session.user))
            setError(null)
          } else {
            // Email not confirmed yet
            setUser(null)
            setError('Please check your email and click the confirmation link to complete registration.')
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setError(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Update user data on token refresh
          setUser(transformSupabaseUser(session.user))
        } else if (event === 'USER_UPDATED' && session?.user) {
          // Update user data when user info changes
          setUser(transformSupabaseUser(session.user))
        }
      } catch (err) {
        console.error('Auth state change error:', err)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
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

      // With email confirmation enabled, user won't be automatically signed in
      if (data.user && !data.user.email_confirmed_at) {
        setError('Please check your email and click the confirmation link to complete registration.')
        return { 
          success: true, 
          data, 
          message: 'Registration successful! Please check your email to confirm your account.' 
        }
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
        // Provide more user-friendly error messages
        let userMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Please check your email and click the confirmation link before signing in.'
        }
        
        setError(userMessage)
        return { success: false, error: userMessage }
      }

      // Check if user's email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        setError('Please confirm your email address before signing in.')
        return { success: false, error: 'Please confirm your email address before signing in.' }
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