export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alerts: {
        Row: {
          alert_type: string
          condition_type: string
          created_at: string
          id: number
          is_active: boolean
          parameter_id: number | null
          point_id: number
          threshold_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          condition_type: string
          created_at?: string
          id?: number
          is_active?: boolean
          parameter_id?: number | null
          point_id: number
          threshold_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          condition_type?: string
          created_at?: string
          id?: number
          is_active?: boolean
          parameter_id?: number | null
          point_id?: number
          threshold_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_parameter_id_fkey"
            columns: ["parameter_id"]
            isOneToOne: false
            referencedRelation: "parameters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "points"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: number
          name: string
          state: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          state?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          author: string
          category: string
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_published: boolean
          read_time: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          author: string
          category: string
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          read_time?: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_published?: boolean
          read_time?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      parameters: {
        Row: {
          code: string
          conama_max: number | null
          conama_min: number | null
          created_at: string
          description: string
          id: number
          unit: string
        }
        Insert: {
          code: string
          conama_max?: number | null
          conama_min?: number | null
          created_at?: string
          description: string
          id?: number
          unit: string
        }
        Update: {
          code?: string
          conama_max?: number | null
          conama_min?: number | null
          created_at?: string
          description?: string
          id?: number
          unit?: string
        }
        Relationships: []
      }
      points: {
        Row: {
          created_at: string
          id: number
          latitude: number
          longitude: number
          name: string
          river_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          latitude: number
          longitude: number
          name: string
          river_id: number
        }
        Update: {
          created_at?: string
          id?: number
          latitude?: number
          longitude?: number
          name?: string
          river_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "points_river_id_fkey"
            columns: ["river_id"]
            isOneToOne: false
            referencedRelation: "rivers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_values: {
        Row: {
          created_at: string
          parameter_id: number
          reading_id: number
          value: number
        }
        Insert: {
          created_at?: string
          parameter_id: number
          reading_id: number
          value: number
        }
        Update: {
          created_at?: string
          parameter_id?: number
          reading_id?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "reading_values_parameter_id_fkey"
            columns: ["parameter_id"]
            isOneToOne: false
            referencedRelation: "parameters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_values_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: false
            referencedRelation: "readings"
            referencedColumns: ["id"]
          },
        ]
      }
      readings: {
        Row: {
          created_at: string
          id: number
          iet_score: number | null
          iqa_score: number | null
          measured_at: string
          point_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          iet_score?: number | null
          iqa_score?: number | null
          measured_at?: string
          point_id: number
        }
        Update: {
          created_at?: string
          id?: number
          iet_score?: number | null
          iqa_score?: number | null
          measured_at?: string
          point_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "readings_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "points"
            referencedColumns: ["id"]
          },
        ]
      }
      rivers: {
        Row: {
          city_id: number
          created_at: string
          id: number
          name: string
        }
        Insert: {
          city_id: number
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          city_id?: number
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rivers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
