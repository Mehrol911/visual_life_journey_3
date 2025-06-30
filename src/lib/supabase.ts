import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Improve session persistence
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // Handle email confirmation redirects
    flowType: 'pkce'
  }
})

// Auth helper functions with improved error handling
export const signUp = async (email: string, password: string, userData: any) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        // Redirect URL for email confirmation (optional)
        emailRedirectTo: window.location.origin
      }
    })
    return { data, error }
  } catch (err) {
    console.error('SignUp error:', err)
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Registration failed' } 
    }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  } catch (err) {
    console.error('SignIn error:', err)
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Login failed' } 
    }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    console.error('SignOut error:', err)
    return { error: { message: err instanceof Error ? err.message : 'Logout failed' } }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  } catch (err) {
    console.error('GetCurrentUser error:', err)
    return { 
      user: null, 
      error: { message: err instanceof Error ? err.message : 'Failed to get user' } 
    }
  }
}

export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    try {
      callback(event, session)
    } catch (err) {
      console.error('Auth state change callback error:', err)
    }
  })
}

// Helper function to check if user's email is confirmed
export const isEmailConfirmed = (user: any): boolean => {
  return !!(user?.email_confirmed_at)
}

// Helper function to resend confirmation email
export const resendConfirmation = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: window.location.origin
      }
    })
    return { data, error }
  } catch (err) {
    console.error('Resend confirmation error:', err)
    return { 
      data: null, 
      error: { message: err instanceof Error ? err.message : 'Failed to resend confirmation' } 
    }
  }
}