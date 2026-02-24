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
      invoices: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          paid_at: string | null
          shipment_id: string | null
          status: string
          tax: number | null
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          paid_at?: string | null
          shipment_id?: string | null
          status?: string
          tax?: number | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          paid_at?: string | null
          shipment_id?: string | null
          status?: string
          tax?: number | null
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          actual_delivery: string | null
          created_at: string
          created_by: string | null
          dimensions: string | null
          estimated_delivery: string | null
          id: string
          package_description: string | null
          receiver_address: string
          receiver_email: string | null
          receiver_name: string
          receiver_phone: string | null
          sender_address: string
          sender_email: string | null
          sender_id: string | null
          sender_name: string
          sender_phone: string | null
          shipping_cost: number | null
          status: string
          tracking_number: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          actual_delivery?: string | null
          created_at?: string
          created_by?: string | null
          dimensions?: string | null
          estimated_delivery?: string | null
          id?: string
          package_description?: string | null
          receiver_address: string
          receiver_email?: string | null
          receiver_name: string
          receiver_phone?: string | null
          sender_address: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name: string
          sender_phone?: string | null
          shipping_cost?: number | null
          status?: string
          tracking_number: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          actual_delivery?: string | null
          created_at?: string
          created_by?: string | null
          dimensions?: string | null
          estimated_delivery?: string | null
          id?: string
          package_description?: string | null
          receiver_address?: string
          receiver_email?: string | null
          receiver_name?: string
          receiver_phone?: string | null
          sender_address?: string
          sender_email?: string | null
          sender_id?: string | null
          sender_name?: string
          sender_phone?: string | null
          shipping_cost?: number | null
          status?: string
          tracking_number?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          shipment_id: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          shipment_id: string
          status: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
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
      generate_invoice_number: { Args: never; Returns: string }
      generate_tracking_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
