/**
 * Charging Stations
 * Manages charging stations with battery management for robots
 */

import type {
  ChargingStation,
  RobotInstance,
  RobotEvent,
  RobotEventListener,
  RobotSystemConfig,
} from './types';
import {
  RobotEventType,
  DEFAULT_ROBOT_CONFIG,
} from './types';
import { RobotInstances } from './RobotInstances';

/**
 * Charging stations system class
 */
export class ChargingStations {
  private stations: Map<string, ChargingStation>;
  private robotInstances: RobotInstances;
  private config: RobotSystemConfig;
  private eventListeners: Map<RobotEventType, Set<RobotEventListener>>;
  private updateInterval: NodeJS.Timeout | null;

  constructor(
    robotInstances: RobotInstances,
    config?: Partial<RobotSystemConfig>
  ) {
    this.robotInstances = robotInstances;
    this.config = {
      ...DEFAULT_ROBOT_CONFIG,
      ...config,
    };

    this.stations = new Map();
    this.eventListeners = new Map();
    this.updateInterval = null;

    this.startUpdates();
  }

  /**
   * Add charging station
   */
  addStation(station: ChargingStation): void {
    this.stations.set(station.id, station);

    // Fire event
    this.fireEvent({
      type: RobotEventType.CHARGING_STATION_BUILT,
      timestamp: Date.now(),
      stationId: station.id,
    } as any);
  }

  /**
   * Remove charging station
   */
  removeStation(stationId: string): boolean {
    const station = this.stations.get(stationId);
    if (!station) return false;

    // Disconnect all robots from this station
    const robots = this.robotInstances.getAllRobots();
    for (const robot of robots) {
      if (robot.chargingStationId === stationId) {
        robot.chargingStationId = undefined;
        robot.isCharging = false;
      }
    }

    this.stations.delete(stationId);

    // Fire event
    this.fireEvent({
      type: RobotEventType.CHARGING_STATION_DESTROYED,
      timestamp: Date.now(),
      stationId,
    } as any);

    return true;
  }

  /**
   * Get charging station
   */
  getStation(stationId: string): ChargingStation | undefined {
    return this.stations.get(stationId);
  }

  /**
   * Get all stations
   */
  getAllStations(): ChargingStation[] {
    return Array.from(this.stations.values());
  }

  /**
   * Get station by building
   */
  getStationByBuilding(buildingId: string): ChargingStation | undefined {
    return Array.from(this.stations.values()).find(
      station => station.buildingId === buildingId
    );
  }

  /**
   * Start charging robot
   */
  startCharging(robotId: string, stationId: string): boolean {
    const station = this.stations.get(stationId);
    if (!station) return false;

    if (station.currentRobots >= station.maxRobots) return false;

    const robot = this.robotInstances.getRobot(robotId);
    if (!robot) return false;

    station.currentRobots++;
    robot.chargingStationId = stationId;
    robot.isCharging = true;
    station.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_CHARGING_STARTED,
      timestamp: Date.now(),
      robotId,
      stationId,
    } as any);

    return true;
  }

  /**
   * Stop charging robot
   */
  stopCharging(robotId: string): boolean {
    const robot = this.robotInstances.getRobot(robotId);
    if (!robot || !robot.chargingStationId) return false;

    const station = this.stations.get(robot.chargingStationId);
    if (station) {
      station.currentRobots--;
      station.updatedAt = Date.now();
    }

    robot.chargingStationId = undefined;
    robot.isCharging = false;
    robot.updatedAt = Date.now();

    // Fire event
    this.fireEvent({
      type: RobotEventType.ROBOT_CHARGING_COMPLETED,
      timestamp: Date.now(),
      robotId,
      stationId: station?.id,
    } as any);

    return true;
  }

  /**
   * Find nearest available charging station
   */
  findNearestAvailableStation(
    position: { x: number; y: number; z?: number }
  ): ChargingStation | null {
    let nearestStation: ChargingStation | null = null;
    let nearestDistance = Infinity;

    for (const station of this.stations.values()) {
      if (station.currentRobots >= station.maxRobots) continue;

      const dx = station.position.x - position.x;
      const dy = station.position.y - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestStation = station;
      }
    }

    return nearestStation;
  }

  /**
   * Update charging process
   */
  private updateCharging(): void {
    const robots = this.robotInstances.getAllRobots();

    for (const robot of robots) {
      if (!robot.isCharging || !robot.chargingStationId) continue;

      const station = this.stations.get(robot.chargingStationId);
      if (!station) {
        robot.isCharging = false;
        robot.chargingStationId = undefined;
        continue;
      }

      // Charge robot
      const chargeAmount = station.chargingSpeed * station.chargingEfficiency;
      robot.currentBattery = Math.min(
        robot.batteryCapacity,
        robot.currentBattery + chargeAmount
      );
      robot.updatedAt = Date.now();

      // Check if fully charged
      if (robot.currentBattery >= robot.batteryCapacity) {
        this.stopCharging(robot.id);
      }
    }
  }

  /**
   * Start automatic updates
   */
  private startUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.update();
    }, 1000); // Update every second
  }

  /**
   * Stop automatic updates
   */
  private stopUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Update charging stations
   */
  private update(): void {
    this.updateCharging();
  }

  /**
   * Get state
   */
  getState(): Map<string, ChargingStation> {
    return new Map(this.stations);
  }

  /**
   * Set state
   */
  setState(state: Map<string, ChargingStation>): void {
    this.stations = new Map(state);
  }

  /**
   * Reset charging stations
   */
  reset(): void {
    this.stations.clear();
  }

  /**
   * Get station count
   */
  getStationCount(): number {
    return this.stations.size;
  }

  /**
   * Get total charging capacity
   */
  getTotalChargingCapacity(): number {
    let total = 0;
    for (const station of this.stations.values()) {
      total += station.maxRobots;
    }
    return total;
  }

  /**
   * Get current charging usage
   */
  getCurrentChargingUsage(): number {
    let total = 0;
    for (const station of this.stations.values()) {
      total += station.currentRobots;
    }
    return total;
  }

  /**
   * Register event listener
   */
  on(eventType: RobotEventType, listener: RobotEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(eventType: RobotEventType, listener: RobotEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: RobotEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RobotSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get configuration
   */
  getConfig(): RobotSystemConfig {
    return { ...this.config };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopUpdates();
  }
}
