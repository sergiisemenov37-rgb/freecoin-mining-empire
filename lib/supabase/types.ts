/**
 * Supabase Database Types
 * Manually defined based on migration schema
 */

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          telegram_id: number
          telegram_username: string | null
          created_at: string
          updated_at: string
          last_active_at: string
          is_active: boolean
          is_banned: boolean
          banned_at: string | null
          ban_reason: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          telegram_id: number
          telegram_username?: string | null
          created_at?: string
          updated_at?: string
          last_active_at?: string
          is_active?: boolean
          is_banned?: boolean
          banned_at?: string | null
          ban_reason?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          telegram_id?: number
          telegram_username?: string | null
          created_at?: string
          updated_at?: string
          last_active_at?: string
          is_active?: boolean
          is_banned?: boolean
          banned_at?: string | null
          ban_reason?: string | null
          deleted_at?: string | null
        }
      }
      player_profiles: {
        Row: {
          id: string
          player_id: string
          display_name: string
          avatar_url: string | null
          level: number
          experience: number
          title: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          display_name: string
          avatar_url?: string | null
          level?: number
          experience?: number
          title?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          display_name?: string
          avatar_url?: string | null
          level?: number
          experience?: number
          title?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          resource_key: string
          resource_type: 'coins' | 'gems' | 'energy' | 'materials' | 'special'
          name: string
          description: string | null
          icon_url: string | null
          is_tradable: boolean
          max_stack: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resource_key: string
          resource_type: 'coins' | 'gems' | 'energy' | 'materials' | 'special'
          name: string
          description?: string | null
          icon_url?: string | null
          is_tradable?: boolean
          max_stack?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resource_key?: string
          resource_type?: 'coins' | 'gems' | 'energy' | 'materials' | 'special'
          name?: string
          description?: string | null
          icon_url?: string | null
          is_tradable?: boolean
          max_stack?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      resource_balances: {
        Row: {
          id: string
          player_id: string
          resource_id: string
          amount: number
          last_updated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          resource_id: string
          amount?: number
          last_updated_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          resource_id?: string
          amount?: number
          last_updated_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      empire: {
        Row: {
          id: string
          player_id: string
          name: string
          level: number
          experience: number
          grid_size: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          name: string
          level?: number
          experience?: number
          grid_size?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          name?: string
          level?: number
          experience?: number
          grid_size?: number
          created_at?: string
          updated_at?: string
        }
      }
      placed_objects: {
        Row: {
          id: string
          player_id: string
          building_id: string
          grid_x: number
          grid_y: number
          level: number
          status: 'building' | 'active' | 'upgrading' | 'destroyed'
          build_started_at: string | null
          build_completed_at: string | null
          upgrade_started_at: string | null
          upgrade_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          building_id: string
          grid_x: number
          grid_y: number
          level?: number
          status?: 'building' | 'active' | 'upgrading' | 'destroyed'
          build_started_at?: string | null
          build_completed_at?: string | null
          upgrade_started_at?: string | null
          upgrade_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          building_id?: string
          grid_x?: number
          grid_y?: number
          level?: number
          status?: 'building' | 'active' | 'upgrading' | 'destroyed'
          build_started_at?: string | null
          build_completed_at?: string | null
          upgrade_started_at?: string | null
          upgrade_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      building_status: 'building' | 'active' | 'upgrading' | 'destroyed'
      equipment_rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
      equipment_slot: 'tool' | 'armor' | 'accessory' | 'special'
      friendship_status: 'pending' | 'accepted' | 'blocked'
      leaderboard_type: 'total_coins' | 'daily_coins' | 'buildings' | 'research' | 'special'
      notification_priority: 'low' | 'normal' | 'high' | 'urgent'
      notification_type: 'system' | 'quest' | 'social' | 'reward' | 'achievement' | 'alert'
      quest_status: 'available' | 'in_progress' | 'completed' | 'failed'
      quest_type: 'daily' | 'weekly' | 'story' | 'achievement' | 'special'
      research_status: 'available' | 'in_progress' | 'completed' | 'locked'
      resource_type: 'coins' | 'gems' | 'energy' | 'materials' | 'special'
      telemetry_event_type: 'session_start' | 'session_end' | 'action' | 'error' | 'performance'
    }
  }
}
