export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      workouts: {
        Row: {
          id: string
          title: string
          description: string | null
          goal: string | null
          level: string | null
          location: string | null
          duration_minutes: number | null
          equipment_required: boolean | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          goal?: string | null
          level?: string | null
          location?: string | null
          duration_minutes?: number | null
          equipment_required?: boolean | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          goal?: string | null
          level?: string | null
          location?: string | null
          duration_minutes?: number | null
          equipment_required?: boolean | null
        }
      }
      workout_exercises: {
        Row: {
          id: string
          block_id: string
          exercise_ref: string | null
          sequence: number
          display_name: string
          target_sets: number | null
          target_reps: number | null
          target_time_seconds: number | null
          rest_seconds: number | null
          tempo: string | null
          video_url: string | null
          image_url: string | null
        }
        Insert: {
          id?: string
          block_id: string
          exercise_ref?: string | null
          sequence: number
          display_name: string
          target_sets?: number | null
          target_reps?: number | null
          target_time_seconds?: number | null
          rest_seconds?: number | null
          tempo?: string | null
          video_url?: string | null
          image_url?: string | null
        }
        Update: {
          id?: string
          block_id?: string
          exercise_ref?: string | null
          sequence?: number
          display_name?: string
          target_sets?: number | null
          target_reps?: number | null
          target_time_seconds?: number | null
          rest_seconds?: number | null
          tempo?: string | null
          video_url?: string | null
          image_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
