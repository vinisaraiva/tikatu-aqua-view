export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
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
          {
            foreignKeyName: "points_river_id_fkey"
            columns: ["river_id"]
            isOneToOne: false
            referencedRelation: "volunteers_view"
            referencedColumns: ["river_id"]
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
      reading_factors: {
        Row: {
          color_changed: boolean | null
          created_at: string | null
          odor_changed: boolean | null
          rain_48h: boolean | null
          reading_id: number
          solids_nearby: boolean | null
          volume_lower: boolean | null
        }
        Insert: {
          color_changed?: boolean | null
          created_at?: string | null
          odor_changed?: boolean | null
          rain_48h?: boolean | null
          reading_id: number
          solids_nearby?: boolean | null
          volume_lower?: boolean | null
        }
        Update: {
          color_changed?: boolean | null
          created_at?: string | null
          odor_changed?: boolean | null
          rain_48h?: boolean | null
          reading_id?: number
          solids_nearby?: boolean | null
          volume_lower?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reading_factors_reading_id_fkey"
            columns: ["reading_id"]
            isOneToOne: true
            referencedRelation: "readings"
            referencedColumns: ["id"]
          },
        ]
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
          cheiro_alterado: boolean | null
          chuva_48h: boolean | null
          context: Json | null
          cor_alterada: boolean | null
          created_at: string
          id: number
          iet_score: number | null
          iqa_score: number | null
          measured_at: string
          point_id: number
          residuos_visiveis: boolean | null
          volume_reduzido: boolean | null
        }
        Insert: {
          cheiro_alterado?: boolean | null
          chuva_48h?: boolean | null
          context?: Json | null
          cor_alterada?: boolean | null
          created_at?: string
          id?: number
          iet_score?: number | null
          iqa_score?: number | null
          measured_at?: string
          point_id: number
          residuos_visiveis?: boolean | null
          volume_reduzido?: boolean | null
        }
        Update: {
          cheiro_alterado?: boolean | null
          chuva_48h?: boolean | null
          context?: Json | null
          cor_alterada?: boolean | null
          created_at?: string
          id?: number
          iet_score?: number | null
          iqa_score?: number | null
          measured_at?: string
          point_id?: number
          residuos_visiveis?: boolean | null
          volume_reduzido?: boolean | null
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
          {
            foreignKeyName: "rivers_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "volunteers_view"
            referencedColumns: ["city_id"]
          },
        ]
      }
      volunteers: {
        Row: {
          code: string
          created_at: string | null
          id: number
          is_active: boolean
          password_hash: string
          point_id: number
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          is_active?: boolean
          password_hash: string
          point_id: number
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          is_active?: boolean
          password_hash?: string
          point_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "points"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      volunteers_view: {
        Row: {
          city_id: number | null
          city_name: string | null
          code: string | null
          created_at: string | null
          id: number | null
          is_active: boolean | null
          point_id: number | null
          point_name: string | null
          river_id: number | null
          river_name: string | null
          state: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_point_id_fkey"
            columns: ["point_id"]
            isOneToOne: false
            referencedRelation: "points"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      list_admins: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
        }[]
      }
      register_admin_user: {
        Args: {
          admin_email: string
          admin_full_name: string
          admin_password: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
