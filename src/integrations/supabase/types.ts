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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      award_categories: {
        Row: {
          created_at: string
          emoji: string | null
          id: string
          name: string
          season_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string | null
          id?: string
          name: string
          season_id: string
        }
        Update: {
          created_at?: string
          emoji?: string | null
          id?: string
          name?: string
          season_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "award_categories_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "award_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      award_nominations: {
        Row: {
          category_id: string
          created_at: string
          id: string
          nominated_by: string
          nominated_user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          nominated_by: string
          nominated_user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          nominated_by?: string
          nominated_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "award_nominations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "award_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      award_seasons: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          phase: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          phase?: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          phase?: string
          year?: number
        }
        Relationships: []
      }
      award_votes: {
        Row: {
          category_id: string
          created_at: string
          id: string
          voted_by: string
          voted_for: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          voted_by: string
          voted_for: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          voted_by?: string
          voted_for?: string
        }
        Relationships: [
          {
            foreignKeyName: "award_votes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "award_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          event_id: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string | null
          id?: string
          post_id?: string | null
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
        ]
      }
      contributions: {
        Row: {
          amount: number
          created_at: string
          id: string
          note: string | null
          savings_id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          note?: string | null
          savings_id: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          note?: string | null
          savings_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_savings_id_fkey"
            columns: ["savings_id"]
            isOneToOne: false
            referencedRelation: "group_savings"
            referencedColumns: ["id"]
          },
        ]
      }
      event_checklist_items: {
        Row: {
          checked: boolean
          checked_by: string | null
          created_at: string
          event_id: string
          id: string
          label: string
        }
        Insert: {
          checked?: boolean
          checked_by?: string | null
          created_at?: string
          event_id: string
          id?: string
          label: string
        }
        Update: {
          checked?: boolean
          checked_by?: string | null
          created_at?: string
          event_id?: string
          id?: string
          label?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_checklist_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          id: string
          location: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          location?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          location?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_savings: {
        Row: {
          created_at: string
          goal: number
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          goal?: number
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          goal?: number
          id?: string
          name?: string
        }
        Relationships: []
      }
      invites: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          used: boolean
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          used?: boolean
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          used?: boolean
          used_by?: string | null
        }
        Relationships: []
      }
      library_items: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          tags: string[] | null
          title: string
          type: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          tags?: string[] | null
          title: string
          type: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          tags?: string[] | null
          title?: string
          type?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      personal_goals: {
        Row: {
          created_at: string
          current: number
          emoji: string | null
          goal: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current?: number
          emoji?: string | null
          goal: number
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current?: number
          emoji?: string | null
          goal?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          is_poll: boolean | null
          poll_options: Json | null
          poll_question: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_poll?: boolean | null
          poll_options?: Json | null
          poll_question?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_poll?: boolean | null
          poll_options?: Json | null
          poll_question?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          aka: string | null
          avatar_url: string | null
          bio: string | null
          cover_url: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          aka?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          aka?: string | null
          avatar_url?: string | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "lider" | "porta_voz" | "vagabundo"
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
      app_role: ["lider", "porta_voz", "vagabundo"],
    },
  },
} as const
