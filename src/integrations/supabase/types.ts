export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chat_requests: {
        Row: {
          id: string
          seeker_id: string
          listener_id: string | null
          session_id: string | null
          topic: string
          title: string
          status: "pending" | "active" | "cancelled"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seeker_id: string
          listener_id?: string | null
          session_id?: string | null
          topic: string
          title: string
          status?: "pending" | "active" | "cancelled"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seeker_id?: string
          listener_id?: string | null
          session_id?: string | null
          topic?: string
          title?: string
          status?: "pending" | "active" | "cancelled"
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      formation_progress: {
        Row: {
          id: string
          user_id: string
          steps_completed: string[]
          bot_passed: boolean
          badge_earned_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          steps_completed?: string[]
          bot_passed?: boolean
          badge_earned_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          steps_completed?: string[]
          bot_passed?: boolean
          badge_earned_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          seeker_id: string
          listener_id: string | null
          status: "waiting" | "active" | "ended"
          topic_snippet: string | null
          topics: string[] | null
          requested_language: string | null
          created_at: string
        }
        Insert: {
          id?: string
          seeker_id: string
          listener_id?: string | null
          status?: "waiting" | "active" | "ended"
          topic_snippet?: string | null
          topics?: string[] | null
          requested_language?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          seeker_id?: string
          listener_id?: string | null
          status?: "waiting" | "active" | "ended"
          topic_snippet?: string | null
          topics?: string[] | null
          requested_language?: string | null
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          session_id: string
          sender_id: string
          content: string
          sent_at: string
          flagged: boolean
        }
        Insert: {
          id?: string
          session_id: string
          sender_id: string
          content: string
          sent_at?: string
          flagged?: boolean
        }
        Update: {
          id?: string
          session_id?: string
          sender_id?: string
          content?: string
          sent_at?: string
          flagged?: boolean
        }
        Relationships: []
      }
      session_ratings: {
        Row: {
          id: string
          session_id: string
          user_id: string
          rating: number | null
          feedback: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          rating?: number | null
          feedback?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          rating?: number | null
          feedback?: string | null
          created_at?: string
        }
        Relationships: []
      }
      listener_profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          email: string | null
          role: string | null
          first_name: string | null
          last_name: string | null
          country: string | null
          gender: string | null
          bio: string | null
          topics_comfortable: string[] | null
          topics_avoid: string[] | null
          topics_lived_experience: string[] | null
          languages: string[] | null
          verified_agreements: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          email?: string | null
          role?: string | null
          first_name?: string | null
          last_name?: string | null
          country?: string | null
          gender?: string | null
          bio?: string | null
          topics_comfortable?: string[] | null
          topics_avoid?: string[] | null
          topics_lived_experience?: string[] | null
          languages?: string[] | null
          verified_agreements?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          email?: string | null
          role?: string | null
          first_name?: string | null
          last_name?: string | null
          country?: string | null
          gender?: string | null
          bio?: string | null
          topics_comfortable?: string[] | null
          topics_avoid?: string[] | null
          topics_lived_experience?: string[] | null
          languages?: string[] | null
          verified_agreements?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      aura_sessions: {
        Row: {
          id: string
          seeker_id: string
          messages: Json
          started_at: string
          ended_at: string | null
          flagged: boolean
        }
        Insert: {
          id?: string
          seeker_id: string
          messages?: Json
          started_at?: string
          ended_at?: string | null
          flagged?: boolean
        }
        Update: {
          id?: string
          seeker_id?: string
          messages?: Json
          started_at?: string
          ended_at?: string | null
          flagged?: boolean
        }
        Relationships: []
      }
      call_sessions: {
        Row: {
          id: string
          session_id: string
          started_at: string
          ended_at: string | null
          duration_seconds: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          started_at?: string
          ended_at?: string | null
          duration_seconds?: number | null
          created_at?: string
        }
        Relationships: []
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string | null
          resource_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      seeker_profiles: {
        Row: {
          id: string
          user_id: string
          username: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          email?: string | null
          created_at?: string
        }
        Relationships: []
      }
      breathing_sessions: {
        Row: {
          id: string
          user_id: string
          duration_seconds: number | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          duration_seconds?: number | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          duration_seconds?: number | null
          completed?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_chat_request: {
        Args: { request_id: string }
        Returns: string
      }
      check_username_available: {
        Args: { desired_username: string }
        Returns: boolean
      }
      is_moderator: {
        Args: { _user_id: string }
        Returns: boolean
      }
      create_profile_from_signup_metadata: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      update_updated_at_column: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
    }
    Enums: {
      session_status: "waiting" | "active" | "ended"
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
    Enums: {
      session_status: ["waiting", "active", "ended"],
    },
  },
} as const
