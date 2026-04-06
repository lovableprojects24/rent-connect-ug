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
      find_user_by_email: { Args: { _email: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_property_staff: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "landlord" | "tenant" | "agent" | "admin" | "finance"
      lease_status: "active" | "inactive" | "pending" | "terminated"
      maintenance_priority: "low" | "medium" | "high" | "urgent"
      maintenance_status: "open" | "in_progress" | "resolved" | "closed"
      payment_method:
        | "mtn_momo"
        | "airtel_money"
        | "cash"
        | "bank_transfer"
        | "pesapal"
      payment_status: "completed" | "pending" | "failed"
      payment_type: "rent" | "deposit" | "maintenance"
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
      app_role: ["landlord", "tenant", "agent", "admin", "finance"],
      lease_status: ["active", "inactive", "pending", "terminated"],
      maintenance_priority: ["low", "medium", "high", "urgent"],
      maintenance_status: ["open", "in_progress", "resolved", "closed"],
      payment_method: [
        "mtn_momo",
        "airtel_money",
        "cash",
        "bank_transfer",
        "pesapal",
      ],
      payment_status: ["completed", "pending", "failed"],
      payment_type: ["rent", "deposit", "maintenance"],
      unit_status: ["occupied", "vacant", "reserved"],
      unit_type: ["apartment", "room", "bed"],
    },
  },
} as const
