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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      kyc_verifications: {
        Row: {
          created_at: string
          expiry_date: string | null
          id: string
          id_back_url: string | null
          id_front_url: string | null
          id_number: string
          id_type: Database["public"]["Enums"]["id_document_type"]
          notes: string | null
          rejection_reason: string | null
          selfie_url: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          id_number: string
          id_type: Database["public"]["Enums"]["id_document_type"]
          notes?: string | null
          rejection_reason?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          expiry_date?: string | null
          id?: string
          id_back_url?: string | null
          id_front_url?: string | null
          id_number?: string
          id_type?: Database["public"]["Enums"]["id_document_type"]
          notes?: string | null
          rejection_reason?: string | null
          selfie_url?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      leases: {
        Row: {
          created_at: string
          deposit: number
          end_date: string
          id: string
          property_id: string
          rent_amount: number
          start_date: string
          status: Database["public"]["Enums"]["lease_status"]
          tenant_id: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit?: number
          end_date: string
          id?: string
          property_id: string
          rent_amount: number
          start_date: string
          status?: Database["public"]["Enums"]["lease_status"]
          tenant_id: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit?: number
          end_date?: string
          id?: string
          property_id?: string
          rent_amount?: number
          start_date?: string
          status?: Database["public"]["Enums"]["lease_status"]
          tenant_id?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_requests: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          issue: string
          priority: Database["public"]["Enums"]["maintenance_priority"]
          property_id: string
          resolved_at: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          submitted_by: string
          tenant_id: string | null
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          issue: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          property_id: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          submitted_by: string
          tenant_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          issue?: string
          priority?: Database["public"]["Enums"]["maintenance_priority"]
          property_id?: string
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          submitted_by?: string
          tenant_id?: string | null
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_requests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number
          default_rent_due_day: number | null
          id: string
          payment_methods: Json | null
          steps_completed: Json
          system_contact: string | null
          system_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          default_rent_due_day?: number | null
          id?: string
          payment_methods?: Json | null
          steps_completed?: Json
          system_contact?: string | null
          system_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          default_rent_due_day?: number | null
          id?: string
          payment_methods?: Json | null
          steps_completed?: Json
          system_contact?: string | null
          system_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_requests: {
        Row: {
          account_type: string
          created_at: string
          description: string | null
          email: string
          experience: string | null
          full_name: string
          id: string
          message: string | null
          phone: string
          status: Database["public"]["Enums"]["request_status"]
          unit_count: number | null
          updated_at: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          description?: string | null
          email: string
          experience?: string | null
          full_name: string
          id?: string
          message?: string | null
          phone: string
          status?: Database["public"]["Enums"]["request_status"]
          unit_count?: number | null
          updated_at?: string
        }
        Update: {
          account_type?: string
          created_at?: string
          description?: string | null
          email?: string
          experience?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["request_status"]
          unit_count?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          lease_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          notes: string | null
          payment_date: string
          property_id: string | null
          recorded_by: string
          reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tenant_id: string | null
          type: Database["public"]["Enums"]["payment_type"]
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          lease_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          property_id?: string | null
          recorded_by: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string | null
          type?: Database["public"]["Enums"]["payment_type"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          lease_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          notes?: string | null
          payment_date?: string
          property_id?: string | null
          recorded_by?: string
          reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string | null
          type?: Database["public"]["Enums"]["payment_type"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_approved: boolean
          must_change_password: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_approved?: boolean
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          location: string
          name: string
          owner_id: string
          total_units: number
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          location: string
          name: string
          owner_id: string
          total_units?: number
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          owner_id?: string
          total_units?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      property_staff: {
        Row: {
          created_at: string
          id: string
          property_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          property_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          property_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_staff_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_applications: {
        Row: {
          applicant_user_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          message: string | null
          phone: string
          property_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["application_status"]
          unit_id: string
          updated_at: string
        }
        Insert: {
          applicant_user_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          message?: string | null
          phone: string
          property_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          unit_id: string
          updated_at?: string
        }
        Update: {
          applicant_user_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string
          property_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          unit_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          created_by: string
          email: string | null
          emergency_contact: string | null
          full_name: string
          id: string
          phone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          email?: string | null
          emergency_contact?: string | null
          full_name: string
          id?: string
          phone: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          email?: string | null
          emergency_contact?: string | null
          full_name?: string
          id?: string
          phone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      unit_transfers: {
        Row: {
          created_at: string
          from_tenant_id: string
          id: string
          new_lease_id: string | null
          old_deposit_amount: number
          old_lease_id: string
          property_id: string
          reason: string | null
          to_tenant_id: string
          transferred_by: string
          unit_id: string
        }
        Insert: {
          created_at?: string
          from_tenant_id: string
          id?: string
          new_lease_id?: string | null
          old_deposit_amount?: number
          old_lease_id: string
          property_id: string
          reason?: string | null
          to_tenant_id: string
          transferred_by: string
          unit_id: string
        }
        Update: {
          created_at?: string
          from_tenant_id?: string
          id?: string
          new_lease_id?: string | null
          old_deposit_amount?: number
          old_lease_id?: string
          property_id?: string
          reason?: string | null
          to_tenant_id?: string
          transferred_by?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_transfers_from_tenant_id_fkey"
            columns: ["from_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_transfers_new_lease_id_fkey"
            columns: ["new_lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_transfers_old_lease_id_fkey"
            columns: ["old_lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_transfers_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_transfers_to_tenant_id_fkey"
            columns: ["to_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_transfers_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          created_at: string
          id: string
          name: string
          property_id: string
          rent_amount: number
          status: Database["public"]["Enums"]["unit_status"]
          type: Database["public"]["Enums"]["unit_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          property_id: string
          rent_amount?: number
          status?: Database["public"]["Enums"]["unit_status"]
          type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          property_id?: string
          rent_amount?: number
          status?: Database["public"]["Enums"]["unit_status"]
          type?: Database["public"]["Enums"]["unit_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "units_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
          role: Database["public"]["Enums"]["app_role"]
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
      create_notification: {
        Args: {
          _message: string
          _related_entity_id?: string
          _related_entity_type?: string
          _title: string
          _type?: Database["public"]["Enums"]["notification_type"]
          _user_id: string
        }
        Returns: string
      }
      find_user_by_email: { Args: { _email: string }; Returns: string }
      generate_late_payment_alerts: { Args: never; Returns: number }
      generate_lease_expiry_alerts: { Args: never; Returns: number }
      generate_rent_reminders: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_lease_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_property_owner: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      is_property_staff: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      is_tenant_on_staff_property: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "landlord"
        | "tenant"
        | "agent"
        | "admin"
        | "finance"
        | "manager"
      application_status: "pending" | "approved" | "rejected" | "cancelled"
      id_document_type:
        | "national_id"
        | "passport"
        | "drivers_license"
        | "voter_id"
        | "work_permit"
      kyc_status: "pending" | "verified" | "rejected" | "expired"
      lease_status: "active" | "inactive" | "pending" | "terminated"
      maintenance_priority: "low" | "medium" | "high" | "urgent"
      maintenance_status: "open" | "in_progress" | "resolved" | "closed"
      notification_type:
        | "rent_reminder"
        | "late_payment"
        | "maintenance"
        | "general"
        | "lease_expiry"
      payment_method:
        | "mtn_momo"
        | "airtel_money"
        | "cash"
        | "bank_transfer"
        | "pesapal"
      payment_status: "completed" | "pending" | "failed"
      payment_type: "rent" | "deposit" | "maintenance"
      request_status: "pending" | "approved" | "rejected"
      unit_status: "occupied" | "vacant" | "reserved"
      unit_type: "apartment" | "room" | "bed"
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
      app_role: ["landlord", "tenant", "agent", "admin", "finance", "manager"],
      application_status: ["pending", "approved", "rejected", "cancelled"],
      id_document_type: [
        "national_id",
        "passport",
        "drivers_license",
        "voter_id",
        "work_permit",
      ],
      kyc_status: ["pending", "verified", "rejected", "expired"],
      lease_status: ["active", "inactive", "pending", "terminated"],
      maintenance_priority: ["low", "medium", "high", "urgent"],
      maintenance_status: ["open", "in_progress", "resolved", "closed"],
      notification_type: [
        "rent_reminder",
        "late_payment",
        "maintenance",
        "general",
        "lease_expiry",
      ],
      payment_method: [
        "mtn_momo",
        "airtel_money",
        "cash",
        "bank_transfer",
        "pesapal",
      ],
      payment_status: ["completed", "pending", "failed"],
      payment_type: ["rent", "deposit", "maintenance"],
      request_status: ["pending", "approved", "rejected"],
      unit_status: ["occupied", "vacant", "reserved"],
      unit_type: ["apartment", "room", "bed"],
    },
  },
} as const
