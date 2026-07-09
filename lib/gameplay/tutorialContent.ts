/**
 * Vertical Slice Tutorial Content
 * 15-minute gameplay experience tutorial
 */

import type { Tutorial, Objective } from './types';
import { TutorialStepType, TutorialStepStatus, ObjectiveType, ObjectiveStatus } from './types';

/**
 * Vertical slice tutorial
 */
export const VERTICAL_SLICE_TUTORIAL: Tutorial = {
  id: 'tutorial_vertical_slice',
  name: 'Getting Started',
  description: 'Learn the basics of building your mining empire',
  version: 1,
  
  steps: [
    {
      id: 'step_welcome',
      tutorialId: 'tutorial_vertical_slice',
      order: 0,
      type: TutorialStepType.INFORMATION,
      title: 'Welcome to FreeCoin Empire',
      description: 'You are about to build your first mining empire. This tutorial will guide you through the basics of hardware placement, power management, and mining.',
      completionConditions: [
        {
          type: 'event',
          eventType: 'tutorial_continue',
        },
      ],
      uiConfig: {
        position: 'center',
        showOverlay: true,
        allowSkip: true,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_empire_created',
      tutorialId: 'tutorial_vertical_slice',
      order: 1,
      type: TutorialStepType.INFORMATION,
      title: 'Empire Created',
      description: 'Your empire has been created! You start with 100 FreeCoin and an empty room. Let\'s get started by placing your first hardware.',
      completionConditions: [
        {
          type: 'event',
          eventType: 'empire_created',
        },
      ],
      uiConfig: {
        position: 'center',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_starter_hardware',
      tutorialId: 'tutorial_vertical_slice',
      order: 2,
      type: TutorialStepType.INFORMATION,
      title: 'Starter Hardware',
      description: 'You have received starter hardware: 1 Solar Panel, 1 Battery, and 1 Cooling Fan. These are essential for building your power network.',
      completionConditions: [
        {
          type: 'event',
          eventType: 'starter_hardware_received',
        },
      ],
      uiConfig: {
        position: 'center',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_placement_intro',
      tutorialId: 'tutorial_vertical_slice',
      order: 3,
      type: TutorialStepType.INFORMATION,
      title: 'Hardware Placement',
      description: 'Click on a tile in your room to place hardware. The grid shows available space. Start by placing your Solar Panel to generate power.',
      completionConditions: [
        {
          type: 'event',
          eventType: 'hardware_placed',
        },
      ],
      uiConfig: {
        highlightElement: 'room-grid',
        position: 'bottom',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_power_network',
      tutorialId: 'tutorial_vertical_slice',
      order: 4,
      type: TutorialStepType.INFORMATION,
      title: 'Building Power Network',
      description: 'Place your Battery and Cooling Fan to complete the power network. The Battery stores power, and the Cooling Fan keeps your hardware from overheating.',
      completionConditions: [
        {
          type: 'event',
          eventType: 'power_network_complete',
        },
      ],
      uiConfig: {
        highlightElement: 'room-grid',
        position: 'bottom',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_gpu_placement',
      tutorialId: 'tutorial_vertical_slice',
      order: 5,
      type: TutorialStepType.INFORMATION,
      title: 'Install Your First GPU',
      description: 'Now place your first GPU. GPUs are the heart of your mining operation. They require power and cooling to function.',
      completionConditions: [
        {
          type: 'event',
          eventType: 'gpu_placed',
        },
      ],
      uiConfig: {
        highlightElement: 'room-grid',
        position: 'bottom',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_simulation_start',
      tutorialId: 'tutorial_vertical_slice',
      order: 6,
      type: TutorialStepType.INFORMATION,
      title: 'Start Simulation',
      description: 'Click the Start button to begin the simulation. Your hardware will start operating, and you\'ll begin mining FreeCoin!',
      completionConditions: [
        {
          type: 'event',
          eventType: 'simulation_started',
        },
      ],
      uiConfig: {
        highlightElement: 'simulation-button',
        position: 'bottom',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_first_coin',
      tutorialId: 'tutorial_vertical_slice',
      order: 7,
      type: TutorialStepType.INFORMATION,
      title: 'First FreeCoin Mined!',
      description: 'Congratulations! You\'ve mined your first FreeCoin. Watch your currency balance grow as your GPU continues to mine.',
      completionConditions: [
        {
          type: 'event',
          eventType: 'first_coin_mined',
        },
      ],
      uiConfig: {
        highlightElement: 'currency-display',
        position: 'top',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_buy_gpu',
      tutorialId: 'tutorial_vertical_slice',
      order: 8,
      type: TutorialStepType.INFORMATION,
      title: 'Buy Second GPU',
      description: 'With your earned FreeCoin, you can now buy a second GPU. Click the Shop button, select a GPU, and purchase it.',
      completionConditions: [
        {
          type: 'event',
          eventType: 'gpu_purchased',
        },
      ],
      uiConfig: {
        highlightElement: 'shop-button',
        position: 'bottom',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_expand_room',
      tutorialId: 'tutorial_vertical_slice',
      order: 9,
      type: TutorialStepType.INFORMATION,
      title: 'Expand Your Room',
      description: 'Your room is getting crowded. Expand it to make space for more hardware. Click the Expand button and select a size.',
      completionConditions: [
        {
          type: 'event',
          eventType: 'room_expanded',
        },
      ],
      uiConfig: {
        highlightElement: 'expand-button',
        position: 'bottom',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
    {
      id: 'step_complete',
      tutorialId: 'tutorial_vertical_slice',
      order: 10,
      type: TutorialStepType.INFORMATION,
      title: 'Tutorial Complete!',
      description: 'You\'ve completed the tutorial! You now have a working mining operation. Continue expanding your empire, upgrade your hardware, and become the ultimate FreeCoin miner!',
      completionConditions: [
        {
          type: 'event',
          eventType: 'tutorial_complete',
        },
      ],
      uiConfig: {
        position: 'center',
        showOverlay: true,
        allowSkip: false,
      },
      status: TutorialStepStatus.NOT_STARTED,
    },
  ],
  
  config: {
    allowSkip: false,
    autoAdvance: true,
    showProgress: true,
  },
  
  status: TutorialStepStatus.NOT_STARTED,
};

/**
 * Vertical slice objectives
 */
export const VERTICAL_SLICE_OBJECTIVES: Objective[] = [
  {
    id: 'obj_place_solar',
    type: ObjectiveType.SINGLE,
    title: 'Place Solar Panel',
    description: 'Place your Solar Panel to generate power',
    completionConditions: [
      {
        id: 'cond_solar_placed',
        type: 'event',
        description: 'Place Solar Panel',
        eventType: 'hardware_placed',
        eventCount: 1,
        currentProgress: 0,
        targetProgress: 1,
      },
    ],
    rewards: [
      {
        type: 'currency',
        currencyType: 'freecoin',
        amount: 10,
      },
    ],
    config: {
      autoComplete: true,
    },
    status: ObjectiveStatus.LOCKED,
    progress: {},
  },
  {
    id: 'obj_complete_power_network',
    type: ObjectiveType.SINGLE,
    title: 'Complete Power Network',
    description: 'Place Battery and Cooling Fan to complete the power network',
    completionConditions: [
      {
        id: 'cond_power_complete',
        type: 'event',
        description: 'Complete power network',
        eventType: 'power_network_complete',
        eventCount: 1,
        currentProgress: 0,
        targetProgress: 1,
      },
    ],
    rewards: [
      {
        type: 'currency',
        currencyType: 'freecoin',
        amount: 20,
      },
    ],
    config: {
      autoComplete: true,
    },
    status: ObjectiveStatus.LOCKED,
    progress: {},
    prerequisiteIds: ['obj_place_solar'],
  },
  {
    id: 'obj_place_gpu',
    type: ObjectiveType.SINGLE,
    title: 'Place First GPU',
    description: 'Place your first GPU to start mining',
    completionConditions: [
      {
        id: 'cond_gpu_placed',
        type: 'event',
        description: 'Place GPU',
        eventType: 'gpu_placed',
        eventCount: 1,
        currentProgress: 0,
        targetProgress: 1,
      },
    ],
    rewards: [
      {
        type: 'currency',
        currencyType: 'freecoin',
        amount: 30,
      },
    ],
    config: {
      autoComplete: true,
    },
    status: ObjectiveStatus.LOCKED,
    progress: {},
    prerequisiteIds: ['obj_complete_power_network'],
  },
  {
    id: 'obj_start_mining',
    type: ObjectiveType.SINGLE,
    title: 'Start Mining',
    description: 'Start the simulation to begin mining FreeCoin',
    completionConditions: [
      {
        id: 'cond_mining_started',
        type: 'event',
        description: 'Start mining',
        eventType: 'simulation_started',
        eventCount: 1,
        currentProgress: 0,
        targetProgress: 1,
      },
    ],
    rewards: [
      {
        type: 'currency',
        currencyType: 'freecoin',
        amount: 50,
      },
    ],
    config: {
      autoComplete: true,
    },
    status: ObjectiveStatus.LOCKED,
    progress: {},
    prerequisiteIds: ['obj_place_gpu'],
  },
  {
    id: 'obj_earn_first_coin',
    type: ObjectiveType.SINGLE,
    title: 'Earn First.FreeCoin',
    description: 'Mine your first FreeCoin',
    completionConditions: [
      {
        id: 'cond_first_coin',
        type: 'event',
        description: 'Mine first FreeCoin',
        eventType: 'first_coin_mined',
        eventCount: 1,
        currentProgress: 0,
        targetProgress: 1,
      },
    ],
    rewards: [
      {
        type: 'currency',
        currencyType: 'freecoin',
        amount: 100,
      },
    ],
    config: {
      autoComplete: true,
    },
    status: ObjectiveStatus.LOCKED,
    progress: {},
    prerequisiteIds: ['obj_start_mining'],
  },
  {
    id: 'obj_buy_second_gpu',
    type: ObjectiveType.SINGLE,
    title: 'Buy Second GPU',
    description: 'Purchase a second GPU with your earned FreeCoin',
    completionConditions: [
      {
        id: 'cond_gpu_purchased',
        type: 'event',
        description: 'Purchase GPU',
        eventType: 'gpu_purchased',
        eventCount: 1,
        currentProgress: 0,
        targetProgress: 1,
      },
    ],
    rewards: [
      {
        type: 'currency',
        currencyType: 'freecoin',
        amount: 50,
      },
    ],
    config: {
      autoComplete: true,
    },
    status: ObjectiveStatus.LOCKED,
    progress: {},
    prerequisiteIds: ['obj_earn_first_coin'],
  },
  {
    id: 'obj_expand_room',
    type: ObjectiveType.SINGLE,
    title: 'Expand Room',
    description: 'Expand your room to make space for more hardware',
    completionConditions: [
      {
        id: 'cond_room_expanded',
        type: 'event',
        description: 'Expand room',
        eventType: 'room_expanded',
        eventCount: 1,
        currentProgress: 0,
        targetProgress: 1,
      },
    ],
    rewards: [
      {
        type: 'currency',
        currencyType: 'freecoin',
        amount: 75,
      },
      {
        type: 'unlock',
        unlockId: 'advanced_hardware',
      },
    ],
    config: {
      autoComplete: true,
    },
    status: ObjectiveStatus.LOCKED,
    progress: {},
    prerequisiteIds: ['obj_buy_second_gpu'],
  },
];
