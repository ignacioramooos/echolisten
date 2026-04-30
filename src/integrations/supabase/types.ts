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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      aura_sessions: {
        Row: {
          ended_at: string | null
          flagged: boolean
          id: string
          messages: Json
          seeker_id: string
          started_at: string
        }
        Insert: {
          ended_at?: string | null
          flagged?: boolean
          id?: string
          messages?: Json
          seeker_id: string
          started_at?: string
        }
        Update: {
          ended_at?: string | null
          flagged?: boolean
          id?: string
          messages?: Json
          seeker_id?: string
          started_at?: string
        }
        Relationships: []
      }
      chat_requests: {
        Row: {
          created_at: string
          id: string
          listener_id: string | null
          seeker_id: string
          session_id: string | null
          status: string
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listener_id?: string | null
          seeker_id: string
          session_id?: string | null
          status?: string
          title: string
          topic: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listener_id?: string | null
          seeker_id?: string
          session_id?: string | null
          status?: string
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_requests_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      breathing_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration_seconds: number
          id: string
          mood_after: string | null
          pattern: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_seconds: number
          id?: string
          mood_after?: string | null
          pattern: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_seconds?: number
          id?: string
          mood_after?: string | null
          pattern?: string
          user_id?: string
        }
        Relationships: []
      }
      counters: {
        Row: {
          count: number | null
          counter_type: string
          created_at: string | null
          id: string
          label: string
          last_reset: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          count?: number | null
          counter_type: string
          created_at?: string | null
          id?: string
          label: string
          last_reset?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          count?: number | null
          counter_type?: string
          created_at?: string | null
          id?: string
          label?: string
          last_reset?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dashboard_widgets: {
        Row: {
          config: Json | null
          created_at: string | null
          height: number
          id: string
          position_x: number
          position_y: number
          type: string
          user_id: string
          width: number
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          type: string
          user_id: string
          width?: number
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          height?: number
          id?: string
          position_x?: number
          position_y?: number
          type?: string
          user_id?: string
          width?: number
        }
        Relationships: []
      }
      evaluations: {
        Row: {
          flags_checked: string[]
          id: string
          moderator_id: string
          notes: string | null
          session_id: string
          submitted_at: string
        }
        Insert: {
          flags_checked?: string[]
          id?: string
          moderator_id: string
          notes?: string | null
          session_id: string
          submitted_at?: string
        }
        Update: {
          flags_checked?: string[]
          id?: string
          moderator_id?: string
          notes?: string | null
          session_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      formation_progress: {
        Row: {
          badge_earned_at: string | null
          bot_passed: boolean
          created_at: string
          id: string
          quiz_answers: Json | null
          score: number | null
          steps_completed: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_earned_at?: string | null
          bot_passed?: boolean
          created_at?: string
          id?: string
          quiz_answers?: Json | null
          score?: number | null
          steps_completed?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_earned_at?: string | null
          bot_passed?: boolean
          created_at?: string
          id?: string
          quiz_answers?: Json | null
          score?: number | null
          steps_completed?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          listener_id: string | null
          mode: string
          mood_after: string | null
          mood_before: string | null
          read_at: string | null
          shared_fragment: string | null
          updated_at: string | null
          user_id: string
          visibility: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          listener_id?: string | null
          mode: string
          mood_after?: string | null
          mood_before?: string | null
          read_at?: string | null
          shared_fragment?: string | null
          updated_at?: string | null
          user_id: string
          visibility?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          listener_id?: string | null
          mode?: string
          mood_after?: string | null
          mood_before?: string | null
          read_at?: string | null
          shared_fragment?: string | null
          updated_at?: string | null
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      listener_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          chat_bg_intensity: number | null
          chat_bg_url: string | null
          country: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: string
          languages: string[] | null
          last_name: string | null
          preferred_language: string | null
          role: string
          theme: string | null
          topics_avoid: string[] | null
          topics_comfortable: string[] | null
          topics_lived_experience: string[] | null
          updated_at: string | null
          user_id: string
          username: string | null
          verified_agreements: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          chat_bg_intensity?: number | null
          chat_bg_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          languages?: string[] | null
          last_name?: string | null
          preferred_language?: string | null
          role?: string
          theme?: string | null
          topics_avoid?: string[] | null
          topics_comfortable?: string[] | null
          topics_lived_experience?: string[] | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          verified_agreements?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          chat_bg_intensity?: number | null
          chat_bg_url?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: string
          languages?: string[] | null
          last_name?: string | null
          preferred_language?: string | null
          role?: string
          theme?: string | null
          topics_avoid?: string[] | null
          topics_comfortable?: string[] | null
          topics_lived_experience?: string[] | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          verified_agreements?: boolean | null
        }
        Relationships: []
      }
      memory_shelf: {
        Row: {
          content: string
          created_at: string | null
          id: string
          label: string | null
          source_entry_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          label?: string | null
          source_entry_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          label?: string | null
          source_entry_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_shelf_source_entry_id_fkey"
            columns: ["source_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          flagged: boolean
          id: string
          sender_id: string
          sent_at: string
          session_id: string
        }
        Insert: {
          content: string
          flagged?: boolean
          id?: string
          sender_id: string
          sent_at?: string
          session_id: string
        }
        Update: {
          content?: string
          flagged?: boolean
          id?: string
          sender_id?: string
          sent_at?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_logs: {
        Row: {
          created_at: string | null
          emotional_weather: string | null
          id: string
          need_now: string | null
          primary_feeling: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emotional_weather?: string | null
          id?: string
          need_now?: string | null
          primary_feeling?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          emotional_weather?: string | null
          id?: string
          need_now?: string | null
          primary_feeling?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seeker_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      session_ratings: {
        Row: {
          created_at: string
          feedback: string | null
          id: string
          rating: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: string | null
          id?: string
          rating?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_ratings_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          extend_votes: string[]
          extensions_used: number
          id: string
          listener_id: string | null
          requested_language: string | null
          seeker_id: string
          status: Database["public"]["Enums"]["session_status"]
          timer_end_at: string | null
          topic_snippet: string | null
          topics: string[] | null
        }
        Insert: {
          created_at?: string
          extend_votes?: string[]
          extensions_used?: number
          id?: string
          listener_id?: string | null
          requested_language?: string | null
          seeker_id: string
          status?: Database["public"]["Enums"]["session_status"]
          timer_end_at?: string | null
          topic_snippet?: string | null
          topics?: string[] | null
        }
        Update: {
          created_at?: string
          extend_votes?: string[]
          extensions_used?: number
          id?: string
          listener_id?: string | null
          requested_language?: string | null
          seeker_id?: string
          status?: Database["public"]["Enums"]["session_status"]
          timer_end_at?: string | null
          topic_snippet?: string | null
          topics?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_username_available: {
        Args: { desired_username: string }
        Returns: boolean
      }
      accept_chat_request: { Args: { request_id: string }; Returns: string }
      is_moderator: { Args: { _user_id: string }; Returns: boolean }
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
