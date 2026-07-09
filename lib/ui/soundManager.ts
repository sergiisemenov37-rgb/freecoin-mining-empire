/**
 * Sound Manager
 * Sound hooks and event system
 * No audio files yet - only hooks and event system
 */

export type SoundEvent =
  | 'button_click'
  | 'button_hover'
  | 'notification_success'
  | 'notification_warning'
  | 'notification_error'
  | 'notification_reward'
  | 'mining_start'
  | 'mining_stop'
  | 'resource_gain'
  | 'resource_loss'
  | 'building_complete'
  | 'building_upgrade'
  | 'research_complete'
  | 'robot_start'
  | 'robot_complete'
  | 'page_transition'
  | 'unlock';

export type SoundListener = (event: SoundEvent) => void;

class SoundManager {
  private listeners: Map<SoundEvent, Set<SoundListener>>;
  private enabled: boolean;
  private volume: number;

  constructor() {
    this.listeners = new Map();
    this.enabled = true;
    this.volume = 1.0;
  }

  /**
   * Register event listener
   */
  on(event: SoundEvent, listener: SoundListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * Unregister event listener
   */
  off(event: SoundEvent, listener: SoundListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Fire event to listeners
   */
  private fireEvent(event: SoundEvent): void {
    if (!this.enabled) return;

    const listeners = this.listeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        listener(event);
      }
    }
  }

  /**
   * Play sound for event
   */
  play(event: SoundEvent): void {
    this.fireEvent(event);
  }

  /**
   * Enable/disable sound
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if sound is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Get volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }
}

// Singleton instance
let soundManagerInstance: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
  }
  return soundManagerInstance;
}

/**
 * React hook for sound management
 */
export function useSound() {
  const soundManager = getSoundManager();

  return {
    play: (event: SoundEvent) => soundManager.play(event),
    on: (event: SoundEvent, listener: SoundListener) => soundManager.on(event, listener),
    off: (event: SoundEvent, listener: SoundListener) => soundManager.off(event, listener),
    enabled: soundManager.isEnabled(),
    setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
    volume: soundManager.getVolume(),
    setVolume: (volume: number) => soundManager.setVolume(volume),
  };
}
