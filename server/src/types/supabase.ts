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
      dinosaurs: {
        Row: {
          id: string
          name: string
          scientific_name: string
          period: string
          diet: string
          length_meters: number | null
          weight_tons: number | null
          habitat: string | null
          region: string | null
          description: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          scientific_name: string
          period: string
          diet: string
          length_meters?: number | null
          weight_tons?: number | null
          habitat?: string | null
          region?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          scientific_name?: string
          period?: string
          diet?: string
          length_meters?: number | null
          weight_tons?: number | null
          habitat?: string | null
          region?: string | null
          description?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      dinosaur_fossils: {
        Row: {
          id: string
          dinosaur_id: string
          discovery_location: string
          discovery_date: string | null
          fossil_type: string
          description: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          dinosaur_id: string
          discovery_location: string
          discovery_date?: string | null
          fossil_type: string
          description?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          dinosaur_id?: string
          discovery_location?: string
          discovery_date?: string | null
          fossil_type?: string
          description?: string | null
          image_url?: string | null
          created_at?: string
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