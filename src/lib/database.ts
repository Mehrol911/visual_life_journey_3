import { supabase } from './supabase'

// Database interfaces
export interface DailyReflection {
  id: string
  user_id: string
  date: string
  reflection: string
  mood: number
  gratitude: string[]
  goals: string[]
  notes?: string
  created_at: string
  updated_at: string
}

export interface Book {
  id: string
  user_id: string
  title: string
  author: string
  start_date: string
  finish_date: string
  rating: number
  key_takeaways: string[]
  notes?: string
  category?: string
  created_at: string
  updated_at: string
}

export interface Hero {
  id: string
  user_id: string
  name: string
  profession: string
  description: string
  key_takeaways: string[]
  inspiration: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  date: string
  activity: string
  emoji: string
  duration: number
  intensity: 'Low' | 'Medium' | 'High'
  notes?: string
  calories?: number
  created_at: string
  updated_at: string
}

export interface Relative {
  id: string
  user_id: string
  name: string
  relationship: string
  birth_date?: string
  description?: string
  contact_info: Record<string, any>
  image_url?: string
  is_favorite: boolean
  gift_ideas: string[]
  personal_notes?: string
  created_at: string
  updated_at: string
}

export interface TravelVisit {
  id: string
  user_id: string
  city: string
  country: string
  visit_date: string
  latitude?: number
  longitude?: number
  description?: string
  photos: string[]
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  id: string
  user_id: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ProfileUpdate {
  id: string
  user_id: string
  update_type: string
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  created_at: string
}

// Profile Updates API
export const profileUpdatesAPI = {
  async getUpdateCount(): Promise<number> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase.rpc('get_user_profile_update_count', {
      user_uuid: user.id
    })
    
    if (error) throw error
    return data || 0
  },

  async getUpdateHistory(): Promise<ProfileUpdate[]> {
    const { data, error } = await supabase
      .from('profile_updates')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async logUpdate(updateType: string, oldValue?: any, newValue?: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase.rpc('log_profile_update', {
      user_uuid: user.id,
      update_type_param: updateType,
      old_value_param: oldValue || null,
      new_value_param: newValue || null
    })
    
    if (error) throw error
  }
}

// Daily Reflections API
export const dailyReflectionsAPI = {
  async getAll(): Promise<DailyReflection[]> {
    const { data, error } = await supabase
      .from('daily_reflections')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByDate(date: string): Promise<DailyReflection | null> {
    const { data, error } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('date', date)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async create(reflection: Omit<DailyReflection, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DailyReflection> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('daily_reflections')
      .insert({ ...reflection, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, reflection: Partial<DailyReflection>): Promise<DailyReflection> {
    const { data, error } = await supabase
      .from('daily_reflections')
      .update(reflection)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('daily_reflections')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Books API
export const booksAPI = {
  async getAll(): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(book: Omit<Book, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Book> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('books')
      .insert({ ...book, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, book: Partial<Book>): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .update(book)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Heroes API
export const heroesAPI = {
  async getAll(): Promise<Hero[]> {
    const { data, error } = await supabase
      .from('heroes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(hero: Omit<Hero, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Hero> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('heroes')
      .insert({ ...hero, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, hero: Partial<Hero>): Promise<Hero> {
    const { data, error } = await supabase
      .from('heroes')
      .update(hero)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('heroes')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Workouts API
export const workoutsAPI = {
  async getAll(): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(workout: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Workout> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('workouts')
      .insert({ ...workout, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, workout: Partial<Workout>): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .update(workout)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Enhanced Relatives API with all new fields
export const relativesAPI = {
  async getAll(): Promise<Relative[]> {
    const { data, error } = await supabase
      .from('relatives')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async getUpcomingBirthdays(days: number = 30): Promise<Relative[]> {
    const { data, error } = await supabase
      .from('relatives')
      .select('*')
      .not('birth_date', 'is', null)
      .order('birth_date', { ascending: true })
    
    if (error) throw error
    
    // Filter for upcoming birthdays in the next X days
    const today = new Date()
    const upcoming = (data || []).filter(relative => {
      if (!relative.birth_date) return false
      
      const birthDate = new Date(relative.birth_date)
      const thisYear = today.getFullYear()
      const nextYear = thisYear + 1
      
      // Create birthday dates for this year and next year
      const birthdayThisYear = new Date(thisYear, birthDate.getMonth(), birthDate.getDate())
      const birthdayNextYear = new Date(nextYear, birthDate.getMonth(), birthDate.getDate())
      
      // Check if birthday is within the next X days
      const timeDiffThisYear = birthdayThisYear.getTime() - today.getTime()
      const timeDiffNextYear = birthdayNextYear.getTime() - today.getTime()
      const daysDiffThisYear = Math.ceil(timeDiffThisYear / (1000 * 3600 * 24))
      const daysDiffNextYear = Math.ceil(timeDiffNextYear / (1000 * 3600 * 24))
      
      return (daysDiffThisYear >= 0 && daysDiffThisYear <= days) || 
             (daysDiffNextYear >= 0 && daysDiffNextYear <= days)
    })
    
    return upcoming
  },

  async getBirthdaysThisMonth(): Promise<Relative[]> {
    const { data, error } = await supabase
      .from('relatives')
      .select('*')
      .not('birth_date', 'is', null)
    
    if (error) throw error
    
    const today = new Date()
    const currentMonth = today.getMonth()
    
    return (data || []).filter(relative => {
      if (!relative.birth_date) return false
      const birthDate = new Date(relative.birth_date)
      return birthDate.getMonth() === currentMonth
    })
  },

  async create(relative: Omit<Relative, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Relative> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('relatives')
      .insert({ 
        ...relative, 
        user_id: user.id,
        gift_ideas: relative.gift_ideas || [],
        contact_info: relative.contact_info || {}
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, relative: Partial<Relative>): Promise<Relative> {
    const { data, error } = await supabase
      .from('relatives')
      .update(relative)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('relatives')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Travel Visits API
export const travelVisitsAPI = {
  async getAll(): Promise<TravelVisit[]> {
    const { data, error } = await supabase
      .from('travel_visits')
      .select('*')
      .order('visit_date', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async create(visit: Omit<TravelVisit, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<TravelVisit> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('travel_visits')
      .insert({ ...visit, user_id: user.id })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, visit: Partial<TravelVisit>): Promise<TravelVisit> {
    const { data, error } = await supabase
      .from('travel_visits')
      .update(visit)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('travel_visits')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// User Preferences API
export const userPreferencesAPI = {
  async get(): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async upsert(preferences: Record<string, any>): Promise<UserPreferences> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: user.id, preferences })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}