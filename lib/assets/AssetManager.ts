/**
 * AssetManager
 * Centralized asset management for the game
 * Provides easy access to all production assets
 */

export const AssetManager = {
  // Buildings
  buildings: {
    DATA_CENTER: '/assets/buildings/DATA_CENTER.png',
    FACTORY: '/assets/buildings/FACTORY.png',
    GARAGE: '/assets/buildings/GARAGE.png',
    POWER_STATION: '/assets/buildings/POWER_STATION.png',
    RESEARCH_LAB: '/assets/buildings/RESEARCH_LAB.png',
    SOLAR_FARM: '/assets/buildings/SOLAR_FARM.png',
    STARTER_ROOM: '/assets/buildings/STARTER_ROOM.png',
    WAREHOUSE: '/assets/buildings/WAREHOUSE.png',
    WORKSHOP: '/assets/buildings/WORKSHOP.png',
  },

  // Hardware
  hardware: {
    ASIC: '/assets/hardware/ASIC.png',
    COOLING_UNIT: '/assets/hardware/COOLING_UNIT.png',
    CPU: '/assets/hardware/CPU.png',
    GENERATOR: '/assets/hardware/GENERATOR.png',
    GPU: '/assets/hardware/GPU.png',
    ROBOT: '/assets/hardware/ROBOT.png',
    ROUTER: '/assets/hardware/ROUTER.png',
    SERVER: '/assets/hardware/SERVER.png',
    SOLAR_PANEL: '/assets/hardware/SOLAR_PANEL.png',
  },

  // Resources
  resources: {
    BATTERY: '/assets/icons/resources/BATTERY.png',
    COOLING: '/assets/icons/resources/COOLING.png',
    ENERGY: '/assets/icons/resources/ENERGY.png',
    EXPERIENCE: '/assets/icons/resources/EXPERIENCE.png',
    FREECOIN: '/assets/icons/resources/FREECOIN.png',
    HEAT: '/assets/icons/resources/HEAT.png',
    NETWORK: '/assets/icons/resources/NETWORK.png',
    POWER: '/assets/icons/resources/POWER.png',
    PREMIUM_TOKEN: '/assets/icons/resources/PREMIUM_TOKEN.png',
    RESEARCH: '/assets/icons/resources/RESEARCH.png',
  },

  // Navigation
  navigation: {
    BUILDINGS: '/assets/navigation/BUILDINGS.png',
    FRIENDS: '/assets/navigation/FRIENDS.png',
    HOME: '/assets/navigation/HOME.png',
    INVENTORY: '/assets/navigation/INVENTORY.png',
    LEADERBOARD: '/assets/navigation/LEADERBOARD.png',
    MINING: '/assets/navigation/MINING.png',
    PROFILE: '/assets/navigation/PROFILE.png',
    RESEARCH: '/assets/navigation/RESEARCH.png',
    ROBOTS: '/assets/navigation/ROBOTS.png',
    SETTINGS: '/assets/navigation/SETTINGS.png',
    SHOP: '/assets/navigation/SHOP.png',
    TASKS: '/assets/navigation/TASKS.png',
  },

  // Actions
  actions: {
    build: '/assets/actions/build.png',
    buy: '/assets/actions/buy.png',
    claim: '/assets/actions/claim.png',
    collect: '/assets/actions/collect.png',
    delete: '/assets/actions/delete.png',
    filter: '/assets/actions/filter.png',
    install: '/assets/actions/install.png',
    move: '/assets/actions/move.png',
    remove: '/assets/actions/remove.png',
    repair: '/assets/actions/repair.png',
    rotate: '/assets/actions/rotate.png',
    search: '/assets/actions/search.png',
    sell: '/assets/actions/sell.png',
    sort: '/assets/actions/sort.png',
    upgrade: '/assets/actions/upgrade.png',
  },

  // Status
  status: {
    error: '/assets/icons/status/error.png',
    info: '/assets/icons/status/info.png',
    loading: '/assets/icons/status/loading.png',
    locked: '/assets/icons/status/locked.png',
    offline: '/assets/icons/status/offline.png',
    online: '/assets/icons/status/online.png',
    success: '/assets/icons/status/success.png',
    unlocked: '/assets/icons/status/unlocked.png',
    warning: '/assets/icons/status/warning.png',
  },

  // Icon versions (smaller)
  icons: {
    buildings: {
      DATA_CENTER: '/assets/icons/buildings/DATA_CENTER.png',
      FACTORY: '/assets/icons/buildings/FACTORY.png',
      GARAGE: '/assets/icons/buildings/GARAGE.png',
      POWER_STATION: '/assets/icons/buildings/POWER_STATION.png',
      RESEARCH_LAB: '/assets/icons/buildings/RESEARCH_LAB.png',
      SOLAR_FARM: '/assets/icons/buildings/SOLAR_FARM.png',
      STARTER_ROOM: '/assets/icons/buildings/STARTER_ROOM.png',
      WAREHOUSE: '/assets/icons/buildings/WAREHOUSE.png',
      WORKSHOP: '/assets/icons/buildings/WORKSHOP.png',
    },
    hardware: {
      ASIC: '/assets/icons/hardware/ASIC.png',
      COOLING_UNIT: '/assets/icons/hardware/COOLING_UNIT.png',
      CPU: '/assets/icons/hardware/CPU.png',
      GENERATOR: '/assets/icons/hardware/GENERATOR.png',
      GPU: '/assets/icons/hardware/GPU.png',
      ROBOT: '/assets/icons/hardware/ROBOT.png',
      ROUTER: '/assets/icons/hardware/ROUTER.png',
      SERVER: '/assets/icons/hardware/SERVER.png',
      SOLAR_PANEL: '/assets/icons/hardware/SOLAR_PANEL.png',
    },
    actions: {
      build: '/assets/icons/actions/build.png',
      buy: '/assets/icons/actions/buy.png',
      claim: '/assets/icons/actions/claim.png',
      collect: '/assets/icons/actions/collect.png',
      delete: '/assets/icons/actions/delete.png',
      filter: '/assets/icons/actions/filter.png',
      install: '/assets/icons/actions/install.png',
      move: '/assets/icons/actions/move.png',
      remove: '/assets/icons/actions/remove.png',
      repair: '/assets/icons/actions/repair.png',
      rotate: '/assets/icons/actions/rotate.png',
      search: '/assets/icons/actions/search.png',
      sell: '/assets/icons/actions/sell.png',
      sort: '/assets/icons/actions/sort.png',
      upgrade: '/assets/icons/actions/upgrade.png',
    },
  },

  // Helper function to get building image by key
  getBuilding(key: string): string {
    const buildingKey = key.toUpperCase() as keyof typeof this.buildings;
    return this.buildings[buildingKey] || this.buildings.STARTER_ROOM;
  },

  // Helper function to get hardware image by key
  getHardware(key: string): string {
    const hardwareKey = key.toUpperCase() as keyof typeof this.hardware;
    return this.hardware[hardwareKey] || this.hardware.CPU;
  },

  // Helper function to get resource image by key
  getResource(key: string): string {
    const resourceKey = key.toUpperCase() as keyof typeof this.resources;
    return this.resources[resourceKey] || this.resources.FREECOIN;
  },

  // Helper function to get navigation image by key
  getNavigation(key: string): string {
    const navKey = key.toUpperCase() as keyof typeof this.navigation;
    return this.navigation[navKey] || this.navigation.HOME;
  },

  // Helper function to get action image by key
  getAction(key: string): string {
    const actionKey = key.toLowerCase() as keyof typeof this.actions;
    return this.actions[actionKey] || this.actions.build;
  },
};
