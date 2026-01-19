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
      activity_media: {
        Row: {
          activity_log_id: string
          caption: string | null
          created_at: string | null
          id: string
          media_type: string | null
          media_url: string
        }
        Insert: {
          activity_log_id: string
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url: string
        }
        Update: {
          activity_log_id?: string
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_media_activity_log_id_fkey"
            columns: ["activity_log_id"]
            isOneToOne: false
            referencedRelation: "daily_activity_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          classroom_id: string | null
          content: string
          created_at: string | null
          created_by: string
          event_date: string | null
          id: string
          is_pinned: boolean | null
          priority: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          classroom_id?: string | null
          content: string
          created_at?: string | null
          created_by: string
          event_date?: string | null
          id?: string
          is_pinned?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          classroom_id?: string | null
          content?: string
          created_at?: string | null
          created_by?: string
          event_date?: string | null
          id?: string
          is_pinned?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      child_parent: {
        Row: {
          child_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          parent_id: string
          relationship: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          parent_id: string
          relationship?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          parent_id?: string
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "child_parent_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "child_parent_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          allergies: string | null
          classroom_id: string | null
          created_at: string | null
          date_of_birth: string
          emergency_contact: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          medical_notes: string | null
        }
        Insert: {
          allergies?: string | null
          classroom_id?: string | null
          created_at?: string | null
          date_of_birth: string
          emergency_contact?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          medical_notes?: string | null
        }
        Update: {
          allergies?: string | null
          classroom_id?: string | null
          created_at?: string | null
          date_of_birth?: string
          emergency_contact?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          medical_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "children_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          age_group: string | null
          capacity: number | null
          created_at: string | null
          id: string
          name: string
          teacher_id: string | null
        }
        Insert: {
          age_group?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          name: string
          teacher_id?: string | null
        }
        Update: {
          age_group?: string | null
          capacity?: number | null
          created_at?: string | null
          id?: string
          name?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_activity_logs: {
        Row: {
          activities: string | null
          activity_media_url: string | null
          arrival_time: string | null
          bathroom_notes: string | null
          child_id: string
          created_at: string | null
          created_by: string
          general_notes: string | null
          id: string
          is_acknowledged: boolean | null
          log_date: string
          mood: string | null
          nap_duration: string | null
          pickup_time: string | null
          updated_at: string | null
        }
        Insert: {
          activities?: string | null
          activity_media_url?: string | null
          arrival_time?: string | null
          bathroom_notes?: string | null
          child_id: string
          created_at?: string | null
          created_by: string
          general_notes?: string | null
          id?: string
          is_acknowledged?: boolean | null
          log_date?: string
          mood?: string | null
          nap_duration?: string | null
          pickup_time?: string | null
          updated_at?: string | null
        }
        Update: {
          activities?: string | null
          activity_media_url?: string | null
          arrival_time?: string | null
          bathroom_notes?: string | null
          child_id?: string
          created_at?: string | null
          created_by?: string
          general_notes?: string | null
          id?: string
          is_acknowledged?: boolean | null
          log_date?: string
          mood?: string | null
          nap_duration?: string | null
          pickup_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_activity_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_activity_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          created_at: string | null
          date: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          child_id: string
          created_at: string | null
          created_by: string
          food_items: string
          id: string
          meal_date: string
          meal_type: string | null
          notes: string | null
          portion_consumed: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          created_by: string
          food_items: string
          id?: string
          meal_date?: string
          meal_type?: string | null
          notes?: string | null
          portion_consumed?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          created_by?: string
          food_items?: string
          id?: string
          meal_date?: string
          meal_type?: string | null
          notes?: string | null
          portion_consumed?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_logs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          child_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          child_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          child_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      required_documents: {
        Row: {
          child_id: string
          created_at: string | null
          document_type: string
          due_date: string | null
          file_url: string | null
          id: string
          status: string | null
          submission_date: string | null
        }
        Insert: {
          child_id: string
          created_at?: string | null
          document_type: string
          due_date?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          submission_date?: string | null
        }
        Update: {
          child_id?: string
          created_at?: string | null
          document_type?: string
          due_date?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          submission_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "required_documents_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      school_settings: {
        Row: {
          address: string | null
          close_time: string | null
          created_at: string | null
          date_format: string | null
          description: string | null
          email: string | null
          id: string
          language: string | null
          logo_url: string | null
          name: string
          open_time: string | null
          phone: string | null
          timezone: string | null
          updated_at: string | null
          website: string | null
          work_days: string[] | null
        }
        Insert: {
          address?: string | null
          close_time?: string | null
          created_at?: string | null
          date_format?: string | null
          description?: string | null
          email?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name: string
          open_time?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          work_days?: string[] | null
        }
        Update: {
          address?: string | null
          close_time?: string | null
          created_at?: string | null
          date_format?: string | null
          description?: string | null
          email?: string | null
          id?: string
          language?: string | null
          logo_url?: string | null
          name?: string
          open_time?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string | null
          website?: string | null
          work_days?: string[] | null
        }
        Relationships: []
      }
      teacher_classrooms: {
        Row: {
          classroom_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          teacher_id: string
        }
        Insert: {
          classroom_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          teacher_id: string
        }
        Update: {
          classroom_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_classrooms_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_classrooms_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          phone: string | null
          role: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          role: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          phone?: string | null
          role?: string
        }
        Relationships: []
      }
      wellbeing_media: {
        Row: {
          caption: string | null
          created_at: string | null
          id: string
          media_type: string | null
          media_url: string
          wellbeing_report_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url: string
          wellbeing_report_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          id?: string
          media_type?: string | null
          media_url?: string
          wellbeing_report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wellbeing_media_wellbeing_report_id_fkey"
            columns: ["wellbeing_report_id"]
            isOneToOne: false
            referencedRelation: "wellbeing_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      wellbeing_reports: {
        Row: {
          action_taken: string | null
          child_id: string
          created_at: string | null
          created_by: string
          description: string
          id: string
          incident_type: string | null
          parent_notified: boolean | null
          report_date: string
          severity: string | null
        }
        Insert: {
          action_taken?: string | null
          child_id: string
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          incident_type?: string | null
          parent_notified?: boolean | null
          report_date?: string
          severity?: string | null
        }
        Update: {
          action_taken?: string | null
          child_id?: string
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          incident_type?: string | null
          parent_notified?: boolean | null
          report_date?: string
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wellbeing_reports_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wellbeing_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: string }
      is_parent_of_child: {
        Args: { child_id: string; user_id: string }
        Returns: boolean
      }
      is_teacher_of_child: {
        Args: { child_id: string; user_id: string }
        Returns: boolean
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
