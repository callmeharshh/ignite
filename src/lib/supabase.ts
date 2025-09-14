import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  name: string
  grade?: string
  career_goal?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  technologies: string[]
  github_url?: string
  live_url?: string
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  user_id: string
  name: string
  description: string
  icon: string
  earned_at: string
}

export interface Post {
  id: string
  user_id: string
  content: string
  likes_count: number
  comments_count: number
  created_at: string
  updated_at: string
  author: User
}

export interface StudyBuddy {
  id: string
  user_id: string
  interests: string[]
  level: string
  mutual_connections: number
  connected: boolean
  user: User
}

