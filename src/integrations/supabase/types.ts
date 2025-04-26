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
      applications: {
        Row: {
          ai_summary: string | null
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string | null
          match_score: number | null
          stage: Database["public"]["Enums"]["application_stage"]
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ai_summary?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          match_score?: number | null
          stage?: Database["public"]["Enums"]["application_stage"]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ai_summary?: string | null
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          match_score?: number | null
          stage?: Database["public"]["Enums"]["application_stage"]
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_skills: {
        Row: {
          assessment_score: number
          created_at: string
          id: string
          skill_id: string
          user_id: string
          verified_at: string
        }
        Insert: {
          assessment_score: number
          created_at?: string
          id?: string
          skill_id: string
          user_id: string
          verified_at?: string
        }
        Update: {
          assessment_score?: number
          created_at?: string
          id?: string
          skill_id?: string
          user_id?: string
          verified_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_profiles: {
        Row: {
          benefits: string[] | null
          company_description: string | null
          company_name: string
          company_size: string | null
          created_at: string
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          profile_completeness: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          benefits?: string[] | null
          company_description?: string | null
          company_name: string
          company_size?: string | null
          created_at?: string
          id: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          profile_completeness?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          benefits?: string[] | null
          company_description?: string | null
          company_name?: string
          company_size?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          profile_completeness?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          location: string | null
          organization: string
          start_date: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          organization: string
          start_date: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          location?: string | null
          organization?: string
          start_date?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_seeker_profiles: {
        Row: {
          bio: string | null
          created_at: string
          desired_role: string | null
          education: string | null
          headline: string | null
          id: string
          is_pro: boolean | null
          last_active_check_in: string | null
          location: string | null
          open_to: string | null
          pro_active_status: boolean | null
          profile_completeness: number | null
          resume_url: string | null
          salary_expectation: string | null
          updated_at: string
          years_of_experience: number | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          desired_role?: string | null
          education?: string | null
          headline?: string | null
          id: string
          is_pro?: boolean | null
          last_active_check_in?: string | null
          location?: string | null
          open_to?: string | null
          pro_active_status?: boolean | null
          profile_completeness?: number | null
          resume_url?: string | null
          salary_expectation?: string | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          desired_role?: string | null
          education?: string | null
          headline?: string | null
          id?: string
          is_pro?: boolean | null
          last_active_check_in?: string | null
          location?: string | null
          open_to?: string | null
          pro_active_status?: boolean | null
          profile_completeness?: number | null
          resume_url?: string | null
          salary_expectation?: string | null
          updated_at?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_seeker_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          created_at: string
          id: string
          importance_level: number | null
          job_id: string | null
          skill_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          importance_level?: number | null
          job_id?: string | null
          skill_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          importance_level?: number | null
          job_id?: string | null
          skill_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          created_at: string
          description: string
          employer_id: string | null
          experience_level: string | null
          id: string
          job_type: string | null
          location: string | null
          remote: boolean | null
          required_skills: string[] | null
          salary_max: number | null
          salary_min: number | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          employer_id?: string | null
          experience_level?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          remote?: boolean | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          employer_id?: string | null
          experience_level?: string | null
          id?: string
          job_type?: string | null
          location?: string | null
          remote?: boolean | null
          required_skills?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      power_matches: {
        Row: {
          application_id: string | null
          applied_at: string | null
          created_at: string
          id: string
          job_id: string
          match_score: number
          user_id: string
          viewed_at: string | null
        }
        Insert: {
          application_id?: string | null
          applied_at?: string | null
          created_at?: string
          id?: string
          job_id: string
          match_score: number
          user_id: string
          viewed_at?: string | null
        }
        Update: {
          application_id?: string | null
          applied_at?: string | null
          created_at?: string
          id?: string
          job_id?: string
          match_score?: number
          user_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "power_matches_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "power_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "power_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          type: Database["public"]["Enums"]["user_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          type: Database["public"]["Enums"]["user_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          type?: Database["public"]["Enums"]["user_type"]
          updated_at?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          proficiency_level: number | null
          skill_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          proficiency_level?: number | null
          skill_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          proficiency_level?: number | null
          skill_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_skills_user_id_fkey"
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
      batch_update_application_stage: {
        Args: {
          p_application_ids: string[]
          p_stage: Database["public"]["Enums"]["application_stage"]
          p_user_id: string
        }
        Returns: {
          application_id: string
          success: boolean
          message: string
        }[]
      }
      calculate_match_score: {
        Args: { p_user_id: string; p_job_id: string }
        Returns: number
      }
      calculate_pro_match_score: {
        Args: { p_user_id: string; p_job_id: string }
        Returns: number
      }
      deactivate_inactive_pro_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      debug_power_match_for_job: {
        Args: { p_user_id: string; p_job_id: string }
        Returns: {
          match_score: number
          job_skills: string[]
          assessment_skills: string[]
        }[]
      }
      debug_required_skills: {
        Args: { p_job_id: string }
        Returns: {
          job_id: string
          job_title: string
          required_skills: string[]
          type_of_array: string
          array_length: number
          first_element: string
        }[]
      }
      find_eligible_power_match_jobs: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          job_id: string
          match_score: number
        }[]
      }
      get_job_skills: {
        Args: { job_id: string }
        Returns: {
          id: string
          job_id: string
          skill_id: string
          importance_level: number
          created_at: string
          skill_name: string
          skill_category: string
        }[]
      }
      set_job_skills: {
        Args: { p_job_id: string; p_skills: Json }
        Returns: {
          created_at: string
          id: string
          importance_level: number | null
          job_id: string | null
          skill_id: string | null
        }[]
      }
      trigger_user_power_match: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      application_stage:
        | "Applied"
        | "Screening"
        | "Interview"
        | "Offer"
        | "Rejected"
        | "Withdrawn"
      user_type: "job_seeker" | "employer"
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
    Enums: {
      application_stage: [
        "Applied",
        "Screening",
        "Interview",
        "Offer",
        "Rejected",
        "Withdrawn",
      ],
      user_type: ["job_seeker", "employer"],
    },
  },
} as const
