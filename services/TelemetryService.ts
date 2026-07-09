import { telemetryRepository } from '@/repositories/TelemetryRepository';
import type {
  TelemetryLogInsert,
} from '@/types/database';

/**
 * Telemetry Service
 * Service layer for telemetry operations
 * No business logic - only CRUD operations
 */
export class TelemetryService {
  /**
   * Create telemetry log
   */
  async logEvent(log: TelemetryLogInsert) {
    return telemetryRepository.logEvent(log);
  }

  /**
   * Get player's telemetry logs
   */
  async getPlayerLogs(playerId: string, limit: number = 100, offset: number = 0) {
    return telemetryRepository.getPlayerLogs(playerId, limit, offset);
  }

  /**
   * Get logs by event type
   */
  async getLogsByEventType(eventType: string, limit: number = 100) {
    return telemetryRepository.getLogsByEventType(eventType, limit);
  }

  /**
   * Get logs by event name
   */
  async getLogsByEventName(eventName: string, limit: number = 100) {
    return telemetryRepository.getLogsByEventName(eventName, limit);
  }

  /**
   * Get logs by session ID
   */
  async getLogsBySessionId(sessionId: string) {
    return telemetryRepository.getLogsBySessionId(sessionId);
  }

  /**
   * Get error logs
   */
  async getErrorLogs(limit: number = 100) {
    return telemetryRepository.getErrorLogs(limit);
  }

  /**
   * Delete old logs (cleanup)
   */
  async deleteOldLogs(daysToKeep: number = 30) {
    return telemetryRepository.deleteOldLogs(daysToKeep);
  }

  /**
   * Get logs within date range
   */
  async getLogsByDateRange(startDate: Date, endDate: Date) {
    return telemetryRepository.getLogsByDateRange(startDate, endDate);
  }
}

export const telemetryService = new TelemetryService();
