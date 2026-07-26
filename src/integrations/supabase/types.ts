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
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          invoice_id: string | null
          ip: string | null
          merchant_id: string | null
          meta: Json
          payment_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          invoice_id?: string | null
          ip?: string | null
          merchant_id?: string | null
          meta?: Json
          payment_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          invoice_id?: string | null
          ip?: string | null
          merchant_id?: string | null
          meta?: Json
          payment_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      collection_accounts: {
        Row: {
          country: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          details: Json
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["collection_kind"]
          label: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          details?: Json
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["collection_kind"]
          label: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          details?: Json
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["collection_kind"]
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          invoice_id: string
          name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          invoice_id: string
          name: string
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          invoice_id?: string
          name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_country: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          converted_from: string | null
          created_at: string
          currency: string
          due_at: string | null
          id: string
          merchant_id: string
          notes: string | null
          number: string
          status: Database["public"]["Enums"]["doc_status"]
          subtotal: number
          tax: number
          token: string
          total: number
          updated_at: string
        }
        Insert: {
          client_country?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          converted_from?: string | null
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          merchant_id: string
          notes?: string | null
          number: string
          status?: Database["public"]["Enums"]["doc_status"]
          subtotal?: number
          tax?: number
          token: string
          total?: number
          updated_at?: string
        }
        Update: {
          client_country?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          converted_from?: string | null
          created_at?: string
          currency?: string
          due_at?: string | null
          id?: string
          merchant_id?: string
          notes?: string | null
          number?: string
          status?: Database["public"]["Enums"]["doc_status"]
          subtotal?: number
          tax?: number
          token?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_converted_from_fkey"
            columns: ["converted_from"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          last_seen: string
          page: string | null
          user_id: string
        }
        Insert: {
          last_seen?: string
          page?: string | null
          user_id: string
        }
        Update: {
          last_seen?: string
          page?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          collection_account_id: string | null
          created_at: string
          currency: string
          id: string
          invoice_id: string | null
          merchant_id: string | null
          meta: Json
          method: string
          phone: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tx_ref: string | null
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          collection_account_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          merchant_id?: string | null
          meta?: Json
          method: string
          phone?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tx_ref?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          collection_account_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          merchant_id?: string | null
          meta?: Json
          method?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tx_ref?: string | null
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_collection_account_id_fkey"
            columns: ["collection_account_id"]
            isOneToOne: false
            referencedRelation: "collection_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          brand_color: string | null
          company: string | null
          country: string | null
          created_at: string
          default_currency: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
          invoice_footer: string | null
          logo_url: string | null
          onboarded: boolean
          phone: string | null
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          brand_color?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          default_currency?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          invoice_footer?: string | null
          logo_url?: string | null
          onboarded?: boolean
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          brand_color?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          default_currency?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          invoice_footer?: string | null
          logo_url?: string | null
          onboarded?: boolean
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          quantity: number
          quotation_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          quantity?: number
          quotation_id: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          quantity?: number
          quotation_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_country: string | null
          client_email: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          currency: string
          id: string
          merchant_id: string
          notes: string | null
          number: string
          status: Database["public"]["Enums"]["doc_status"]
          subtotal: number
          tax: number
          token: string
          total: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          client_country?: string | null
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          currency?: string
          id?: string
          merchant_id: string
          notes?: string | null
          number: string
          status?: Database["public"]["Enums"]["doc_status"]
          subtotal?: number
          tax?: number
          token: string
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          client_country?: string | null
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          currency?: string
          id?: string
          merchant_id?: string
          notes?: string | null
          number?: string
          status?: Database["public"]["Enums"]["doc_status"]
          subtotal?: number
          tax?: number
          token?: string
          total?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      get_payout_targets: {
        Args: { _country?: string }
        Returns: {
          country: string
          currency: string
          details: Json
          id: string
          kind: Database["public"]["Enums"]["collection_kind"]
          label: string
        }[]
      }
      get_public_doc: { Args: { _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_public_doc_event: {
        Args: { _action: string; _meta?: Json; _token: string }
        Returns: undefined
      }
      record_public_payment: {
        Args: {
          _meta?: Json
          _method: string
          _phone?: string
          _status?: string
          _token: string
          _tx_ref?: string
          _wallet_address?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "merchant"
      collection_kind:
        | "bank"
        | "mpesa"
        | "mtn"
        | "airtel"
        | "orange"
        | "crypto"
        | "card"
      doc_status:
        | "draft"
        | "sent"
        | "viewed"
        | "paid"
        | "partially_paid"
        | "overdue"
        | "cancelled"
        | "expired"
        | "approved"
        | "declined"
      payment_status:
        | "pending"
        | "processing"
        | "approved"
        | "failed"
        | "refunded"
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
      app_role: ["admin", "merchant"],
      collection_kind: [
        "bank",
        "mpesa",
        "mtn",
        "airtel",
        "orange",
        "crypto",
        "card",
      ],
      doc_status: [
        "draft",
        "sent",
        "viewed",
        "paid",
        "partially_paid",
        "overdue",
        "cancelled",
        "expired",
        "approved",
        "declined",
      ],
      payment_status: [
        "pending",
        "processing",
        "approved",
        "failed",
        "refunded",
      ],
    },
  },
} as const
