/**
 * Building Definitions
 * Configurable building types with properties, requirements, and unlock conditions
 */

import type {
  BuildingDefinition,
  BuildingType,
  BuildingTheme,
} from './types';
import {
  BuildingType as BuildingTypeEnum,
  BuildingTheme as BuildingThemeEnum,
} from './types';

/**
 * Building definitions registry
 */
export class BuildingDefinitions {
  private static definitions: Map<BuildingType, BuildingDefinition> = new Map();

  /**
   * Initialize default building definitions
   */
  static initialize(): void {
    this.registerDefinition(this.createStarterRoomDefinition());
    this.registerDefinition(this.createGarageDefinition());
    this.registerDefinition(this.createWarehouseDefinition());
    this.registerDefinition(this.createWorkshopDefinition());
    this.registerDefinition(this.createFactoryDefinition());
    this.registerDefinition(this.createDataCenterDefinition());
    this.registerDefinition(this.createMegaDataCenterDefinition());
    this.registerDefinition(this.createResearchCampusDefinition());
    this.registerDefinition(this.createOrbitalFacilityDefinition());
  }

  /**
   * Register a building definition
   */
  static registerDefinition(definition: BuildingDefinition): void {
    this.definitions.set(definition.type, definition);
  }

  /**
   * Get building definition by type
   */
  static getDefinition(type: BuildingType): BuildingDefinition | undefined {
    return this.definitions.get(type);
  }

  /**
   * Get all building definitions
   */
  static getAllDefinitions(): BuildingDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Calculate properties for a building at a given level
   */
  static calculateProperties(
    type: BuildingType,
    level: number
  ): Omit<BuildingDefinition, 'type' | 'name' | 'description' | 'upgradeRequirements' | 'defaultTheme' | 'availableThemes' | 'unlockLevel' | 'unlockTier' | 'unlockBuildings' | 'metadata'> {
    const definition = this.getDefinition(type);
    if (!definition) {
      throw new Error(`Building definition not found for type: ${type}`);
    }

    const levelMultiplier = Math.pow(definition.levelMultiplier.powerCapacity, level - 1);

    return {
      baseConstructionTime: definition.baseConstructionTime,
      baseUpgradeTime: definition.baseUpgradeTime,
      baseWidth: definition.baseWidth,
      baseHeight: definition.baseHeight,
      baseFloors: definition.baseFloors,
      baseMaxFloors: definition.baseMaxFloors,
      basePowerCapacity: definition.basePowerCapacity * levelMultiplier,
      baseCoolingCapacity: definition.baseCoolingCapacity * levelMultiplier,
      baseNetworkCapacity: definition.baseNetworkCapacity * levelMultiplier,
      baseMaxHardware: Math.floor(definition.baseMaxHardware * levelMultiplier),
      baseMaxRobots: Math.floor(definition.baseMaxRobots * levelMultiplier),
      baseMaxDecorations: Math.floor(definition.baseMaxDecorations * levelMultiplier),
      baseMaxExpansion: definition.baseMaxExpansion,
      baseMaintenanceCost: definition.baseMaintenanceCost * definition.levelMultiplier.maintenanceCost * levelMultiplier,
      levelMultiplier: definition.levelMultiplier,
    };
  }

  /**
   * Create Starter Room definition
   */
  private static createStarterRoomDefinition(): BuildingDefinition {
    return {
      type: BuildingTypeEnum.STARTER_ROOM,
      name: 'Starter Room',
      description: 'A basic room to begin your mining empire',
      
      baseConstructionTime: 10000, // 10 seconds
      baseUpgradeTime: 15000,
      baseWidth: 5,
      baseHeight: 5,
      baseFloors: 1,
      baseMaxFloors: 1,
      basePowerCapacity: 500,
      baseCoolingCapacity: 300,
      baseNetworkCapacity: 100,
      baseMaxHardware: 5,
      baseMaxRobots: 0,
      baseMaxDecorations: 2,
      baseMaxExpansion: 0,
      baseMaintenanceCost: 10,
      
      levelMultiplier: {
        powerCapacity: 1.5,
        coolingCapacity: 1.5,
        networkCapacity: 1.5,
        maxHardware: 1.5,
        maxRobots: 1.0,
        maxDecorations: 1.5,
        maintenanceCost: 1.2,
      },
      
      upgradeRequirements: {
        level: 1,
        resources: {},
        buildings: [],
      },
      
      defaultTheme: BuildingThemeEnum.INDUSTRIAL,
      availableThemes: [BuildingThemeEnum.INDUSTRIAL, BuildingThemeEnum.MINIMALIST],
      
      unlockLevel: 1,
    };
  }

  /**
   * Create Garage definition
   */
  private static createGarageDefinition(): BuildingDefinition {
    return {
      type: BuildingTypeEnum.GARAGE,
      name: 'Garage',
      description: 'A garage for storing hardware and equipment',
      
      baseConstructionTime: 30000, // 30 seconds
      baseUpgradeTime: 45000,
      baseWidth: 10,
      baseHeight: 8,
      baseFloors: 1,
      baseMaxFloors: 2,
      basePowerCapacity: 2000,
      baseCoolingCapacity: 1500,
      baseNetworkCapacity: 500,
      baseMaxHardware: 20,
      baseMaxRobots: 2,
      baseMaxDecorations: 5,
      baseMaxExpansion: 3,
      baseMaintenanceCost: 50,
      
      levelMultiplier: {
        powerCapacity: 1.6,
        coolingCapacity: 1.6,
        networkCapacity: 1.6,
        maxHardware: 1.6,
        maxRobots: 1.5,
        maxDecorations: 1.5,
        maintenanceCost: 1.3,
      },
      
      upgradeRequirements: {
        level: 2,
        resources: {},
        buildings: [BuildingTypeEnum.STARTER_ROOM],
      },
      
      defaultTheme: BuildingThemeEnum.INDUSTRIAL,
      availableThemes: [BuildingThemeEnum.INDUSTRIAL, BuildingThemeEnum.MODERN],
      
      unlockLevel: 2,
    };
  }

  /**
   * Create Warehouse definition
   */
  private static createWarehouseDefinition(): BuildingDefinition {
    return {
      type: BuildingTypeEnum.WAREHOUSE,
      name: 'Warehouse',
      description: 'A large warehouse for mass hardware storage',
      
      baseConstructionTime: 60000, // 1 minute
      baseUpgradeTime: 90000,
      baseWidth: 20,
      baseHeight: 15,
      baseFloors: 2,
      baseMaxFloors: 4,
      basePowerCapacity: 5000,
      baseCoolingCapacity: 4000,
      baseNetworkCapacity: 1000,
      baseMaxHardware: 100,
      baseMaxRobots: 5,
      baseMaxDecorations: 10,
      baseMaxExpansion: 5,
      baseMaintenanceCost: 100,
      
      levelMultiplier: {
        powerCapacity: 1.7,
        coolingCapacity: 1.7,
        networkCapacity: 1.7,
        maxHardware: 1.7,
        maxRobots: 1.6,
        maxDecorations: 1.6,
        maintenanceCost: 1.4,
      },
      
      upgradeRequirements: {
        level: 3,
        resources: {},
        buildings: [BuildingTypeEnum.GARAGE],
      },
      
      defaultTheme: BuildingThemeEnum.INDUSTRIAL,
      availableThemes: [BuildingThemeEnum.INDUSTRIAL],
      
      unlockLevel: 5,
    };
  }

  /**
   * Create Workshop definition
   */
  private static createWorkshopDefinition(): BuildingDefinition {
    return {
      type: BuildingTypeEnum.WORKSHOP,
      name: 'Workshop',
      description: 'A workshop for hardware maintenance and upgrades',
      
      baseConstructionTime: 45000, // 45 seconds
      baseUpgradeTime: 60000,
      baseWidth: 12,
      baseHeight: 10,
      baseFloors: 2,
      baseMaxFloors: 3,
      basePowerCapacity: 3000,
      baseCoolingCapacity: 2500,
      baseNetworkCapacity: 800,
      baseMaxHardware: 30,
      baseMaxRobots: 3,
      baseMaxDecorations: 8,
      baseMaxExpansion: 4,
      baseMaintenanceCost: 75,
      
      levelMultiplier: {
        powerCapacity: 1.6,
        coolingCapacity: 1.6,
        networkCapacity: 1.6,
        maxHardware: 1.6,
        maxRobots: 1.5,
        maxDecorations: 1.5,
        maintenanceCost: 1.3,
      },
      
      upgradeRequirements: {
        level: 3,
        resources: {},
        buildings: [BuildingTypeEnum.GARAGE],
      },
      
      defaultTheme: BuildingThemeEnum.MODERN,
      availableThemes: [BuildingThemeEnum.MODERN, BuildingThemeEnum.INDUSTRIAL],
      
      unlockLevel: 4,
    };
  }

  /**
   * Create Factory definition
   */
  private static createFactoryDefinition(): BuildingDefinition {
    return {
      type: BuildingTypeEnum.FACTORY,
      name: 'Factory',
      description: 'A factory for mass hardware production',
      
      baseConstructionTime: 120000, // 2 minutes
      baseUpgradeTime: 180000,
      baseWidth: 30,
      baseHeight: 20,
      baseFloors: 3,
      baseMaxFloors: 6,
      basePowerCapacity: 10000,
      baseCoolingCapacity: 8000,
      baseNetworkCapacity: 2000,
      baseMaxHardware: 200,
      baseMaxRobots: 10,
      baseMaxDecorations: 15,
      baseMaxExpansion: 8,
      baseMaintenanceCost: 200,
      
      levelMultiplier: {
        powerCapacity: 1.8,
        coolingCapacity: 1.8,
        networkCapacity: 1.8,
        maxHardware: 1.8,
        maxRobots: 1.7,
        maxDecorations: 1.7,
        maintenanceCost: 1.5,
      },
      
      upgradeRequirements: {
        level: 5,
        resources: {},
        buildings: [BuildingTypeEnum.WAREHOUSE, BuildingTypeEnum.WORKSHOP],
      },
      
      defaultTheme: BuildingThemeEnum.INDUSTRIAL,
      availableThemes: [BuildingThemeEnum.INDUSTRIAL, BuildingThemeEnum.CYBERPUNK],
      
      unlockLevel: 10,
    };
  }

  /**
   * Create Data Center definition
   */
  private static createDataCenterDefinition(): BuildingDefinition {
    return {
      type: BuildingTypeEnum.DATA_CENTER,
      name: 'Data Center',
      description: 'A professional data center for large-scale operations',
      
      baseConstructionTime: 180000, // 3 minutes
      baseUpgradeTime: 270000,
      baseWidth: 40,
      baseHeight: 25,
      baseFloors: 4,
      baseMaxFloors: 8,
      basePowerCapacity: 25000,
      baseCoolingCapacity: 20000,
      baseNetworkCapacity: 5000,
      baseMaxHardware: 500,
      baseMaxRobots: 15,
      baseMaxDecorations: 20,
      baseMaxExpansion: 10,
      baseMaintenanceCost: 500,
      
      levelMultiplier: {
        powerCapacity: 1.9,
        coolingCapacity: 1.9,
        networkCapacity: 1.9,
        maxHardware: 1.9,
        maxRobots: 1.8,
        maxDecorations: 1.8,
        maintenanceCost: 1.6,
      },
      
      upgradeRequirements: {
        level: 8,
        resources: {},
        buildings: [BuildingTypeEnum.FACTORY],
      },
      
      defaultTheme: BuildingThemeEnum.MODERN,
      availableThemes: [BuildingThemeEnum.MODERN, BuildingThemeEnum.FUTURISTIC],
      
      unlockLevel: 15,
    };
  }

  /**
   * Create Mega Data Center definition
   */
  private static createMegaDataCenterDefinition(): BuildingDefinition {
    return {
      type: BuildingTypeEnum.MEGA_DATA_CENTER,
      name: 'Mega Data Center',
      description: 'A massive data center for empire-level operations',
      
      baseConstructionTime: 300000, // 5 minutes
      baseUpgradeTime: 450000,
      baseWidth: 60,
      baseHeight: 40,
      baseFloors: 6,
      baseMaxFloors: 12,
      basePowerCapacity: 100000,
      baseCoolingCapacity: 80000,
      baseNetworkCapacity: 20000,
      baseMaxHardware: 2000,
      baseMaxRobots: 50,
      baseMaxDecorations: 50,
      baseMaxExpansion: 15,
      baseMaintenanceCost: 2000,
      
      levelMultiplier: {
        powerCapacity: 2.0,
        coolingCapacity: 2.0,
        networkCapacity: 2.0,
        maxHardware: 2.0,
        maxRobots: 1.9,
        maxDecorations: 1.9,
        maintenanceCost: 1.7,
      },
      
      upgradeRequirements: {
        level: 12,
        resources: {},
        buildings: [BuildingTypeEnum.DATA_CENTER],
      },
      
      defaultTheme: BuildingThemeEnum.FUTURISTIC,
      availableThemes: [BuildingThemeEnum.FUTURISTIC, BuildingThemeEnum.CYBERPUNK],
      
      unlockLevel: 25,
    };
  }

  /**
   * Create Research Campus definition
   */
  private static createResearchCampusDefinition(): BuildingDefinition {
    return {
      type: BuildingTypeEnum.RESEARCH_CAMPUS,
      name: 'Research Campus',
      description: 'A campus for advanced research and development',
      
      baseConstructionTime: 240000, // 4 minutes
      baseUpgradeTime: 360000,
      baseWidth: 50,
      baseHeight: 35,
      baseFloors: 5,
      baseMaxFloors: 10,
      basePowerCapacity: 50000,
      baseCoolingCapacity: 40000,
      baseNetworkCapacity: 10000,
      baseMaxHardware: 1000,
      baseMaxRobots: 30,
      baseMaxDecorations: 30,
      baseMaxExpansion: 12,
      baseMaintenanceCost: 1000,
      
      levelMultiplier: {
        powerCapacity: 1.9,
        coolingCapacity: 1.9,
        networkCapacity: 1.9,
        maxHardware: 1.9,
        maxRobots: 1.8,
        maxDecorations: 1.8,
        maintenanceCost: 1.6,
      },
      
      upgradeRequirements: {
        level: 10,
        resources: {},
        buildings: [BuildingTypeEnum.DATA_CENTER],
      },
      
      defaultTheme: BuildingThemeEnum.FUTURISTIC,
      availableThemes: [BuildingThemeEnum.FUTURISTIC, BuildingThemeEnum.MODERN],
      
      unlockLevel: 20,
    };
  }

  /**
   * Create Orbital Facility definition
   */
  private static createOrbitalFacilityDefinition(): BuildingDefinition {
    return {
      type: BuildingTypeEnum.ORBITAL_FACILITY,
      name: 'Orbital Facility',
      description: 'A space-based facility for ultimate operations',
      
      baseConstructionTime: 600000, // 10 minutes
      baseUpgradeTime: 900000,
      baseWidth: 100,
      baseHeight: 80,
      baseFloors: 10,
      baseMaxFloors: 20,
      basePowerCapacity: 500000,
      baseCoolingCapacity: 400000,
      baseNetworkCapacity: 100000,
      baseMaxHardware: 10000,
      baseMaxRobots: 200,
      baseMaxDecorations: 100,
      baseMaxExpansion: 20,
      baseMaintenanceCost: 10000,
      
      levelMultiplier: {
        powerCapacity: 2.0,
        coolingCapacity: 2.0,
        networkCapacity: 2.0,
        maxHardware: 2.0,
        maxRobots: 2.0,
        maxDecorations: 2.0,
        maintenanceCost: 1.8,
      },
      
      upgradeRequirements: {
        level: 20,
        resources: {},
        buildings: [BuildingTypeEnum.MEGA_DATA_CENTER, BuildingTypeEnum.RESEARCH_CAMPUS],
      },
      
      defaultTheme: BuildingThemeEnum.FUTURISTIC,
      availableThemes: [BuildingThemeEnum.FUTURISTIC],
      
      unlockLevel: 50,
    };
  }
}

// Initialize definitions on import
BuildingDefinitions.initialize();
