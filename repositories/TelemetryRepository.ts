import { supabase } from '@/lib/supabase';
import type {
  TelemetryLog,
  TelemetryLogInsert,
} from '@/types/database';

/**
 * Telemetry Repository
 * Handles telemetry and analytics logs
 */
export class TelemetryRepository {
  /**
   * Create telemetry log
   */
  async logEvent(log: TelemetryLogInsert): Promise<TelemetryLog> {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .insert(log)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log event: ${error.message}`);
    }

    return data;
  }

  /**
   * Get player's telemetry logs
   */
  async getPlayerLogs(playerId: string, limit: number = 100, offset: number = 0): Promise<TelemetryLog[]> {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get player logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get logs by event type
   */
  async getLogsByEventType(eventType: string, limit: number = 100): Promise<TelemetryLog[]> {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .eq('event_type', eventType)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get logs by event type: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get logs by event name
   */
  async getLogsByEventName(eventName: string, limit: number = 100): Promise<TelemetryLog[]> {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .eq('event_name', eventName)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get logs by event name: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get logs by session ID
   */
  async getLogsBySessionId(sessionId: string): Promise<TelemetryLog[]> {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to get logs by session ID: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get error logs
   */
  async getErrorLogs(limit: number = 100): Promise<TelemetryLog[]> {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .eq('event_type', 'error')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get error logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete old logs (cleanup)
   */
  async deleteOldLogs(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error } = await supabase
      .from('telemetry_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      throw new Error(`Failed to delete old logs: ${error.message}`);
    }
  }

  /**
   * Get logs within date range
   */
  async getLogsByDateRange(startDate: Date, endDate: Date): Promise<TelemetryLog[]> {
    const { data, error } = await supabase
      .from('telemetry_logs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get logs by date range: ${error.message}`);
    }

    return data || [];
  }
}

export const telemetryRepository = new TelemetryRepository();
