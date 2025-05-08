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
      app_preferences: {
        Row: {
          created_at: string
          display_units: string | null
          id: string
          language: string | null
          notifications_enabled: boolean | null
          theme: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_units?: string | null
          id: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_units?: string | null
          id?: string
          language?: string | null
          notifications_enabled?: boolean | null
          theme?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_history: {
        Row: {
          created_at: string
          id: string
          intent: string | null
          message: string
          response: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intent?: string | null
          message: string
          response: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intent?: string | null
          message?: string
          response?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          created_at: string
          daily_motivation: boolean | null
          goal_reminders: boolean | null
          id: string
          special_offers: boolean | null
          updated_at: string
          weekly_summary: boolean | null
        }
        Insert: {
          created_at?: string
          daily_motivation?: boolean | null
          goal_reminders?: boolean | null
          id: string
          special_offers?: boolean | null
          updated_at?: string
          weekly_summary?: boolean | null
        }
        Update: {
          created_at?: string
          daily_motivation?: boolean | null
          goal_reminders?: boolean | null
          id?: string
          special_offers?: boolean | null
          updated_at?: string
          weekly_summary?: boolean | null
        }
        Relationships: []
      }
      expert_sessions: {
        Row: {
          created_at: string | null
          duration: number
          expert_id: string
          id: string
          meeting_link: string | null
          payment_id: string | null
          session_date: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration: number
          expert_id: string
          id?: string
          meeting_link?: string | null
          payment_id?: string | null
          session_date: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number
          expert_id?: string
          id?: string
          meeting_link?: string | null
          payment_id?: string | null
          session_date?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_sessions_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      experts: {
        Row: {
          availability: Json | null
          bio: string
          created_at: string | null
          experience: number
          full_name: string
          hourly_rate: number
          id: string
          is_online: boolean | null
          last_active: string | null
          profile_image: string | null
          specialization: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability?: Json | null
          bio: string
          created_at?: string | null
          experience: number
          full_name: string
          hourly_rate: number
          id?: string
          is_online?: boolean | null
          last_active?: string | null
          profile_image?: string | null
          specialization: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: Json | null
          bio?: string
          created_at?: string | null
          experience?: number
          full_name?: string
          hourly_rate?: number
          id?: string
          is_online?: boolean | null
          last_active?: string | null
          profile_image?: string | null
          specialization?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      meals: {
        Row: {
          calories: number | null
          carbs: number | null
          date: string
          fat: number | null
          id: string
          meal_type: string | null
          name: string
          protein: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          date?: string
          fat?: number | null
          id?: string
          meal_type?: string | null
          name: string
          protein?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          date?: string
          fat?: number | null
          id?: string
          meal_type?: string | null
          name?: string
          protein?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meditation: {
        Row: {
          date: string
          duration: number
          id: string
          notes: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          date?: string
          duration: number
          id?: string
          notes?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          date?: string
          duration?: number
          id?: string
          notes?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meditation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          id: string
          payment_details: Json | null
          payment_method: string
          session_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_details?: Json | null
          payment_method: string
          session_id?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          session_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "expert_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          likes: number | null
          media_url: string | null
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes?: number | null
          media_url?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes?: number | null
          media_url?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          goals: string[] | null
          height: number | null
          id: string
          updated_at: string
          username: string | null
          weight: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          goals?: string[] | null
          height?: number | null
          id: string
          updated_at?: string
          username?: string | null
          weight?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          goals?: string[] | null
          height?: number | null
          id?: string
          updated_at?: string
          username?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      progress: {
        Row: {
          body_fat_percentage: number | null
          date: string
          id: string
          user_id: string
          weight: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          date?: string
          id?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          date?: string
          id?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_settings: {
        Row: {
          created_at: string
          id: string
          last_password_change: string | null
          login_history: Json | null
          two_factor_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          last_password_change?: string | null
          login_history?: Json | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_password_change?: string | null
          login_history?: Json | null
          two_factor_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      sleep: {
        Row: {
          date: string
          hours: number
          id: string
          notes: string | null
          quality_rating: number | null
          user_id: string
        }
        Insert: {
          date?: string
          hours: number
          id?: string
          notes?: string | null
          quality_rating?: number | null
          user_id: string
        }
        Update: {
          date?: string
          hours?: number
          id?: string
          notes?: string | null
          quality_rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sleep_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          calories: number | null
          date: string
          duration: number
          id: string
          name: string
          notes: string | null
          type: string
          user_id: string
        }
        Insert: {
          calories?: number | null
          date?: string
          duration: number
          id?: string
          name: string
          notes?: string | null
          type: string
          user_id: string
        }
        Update: {
          calories?: number | null
          date?: string
          duration?: number
          id?: string
          name?: string
          notes?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
