'use client';

import { useEffect, useRef, useState } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
import { Button } from '@/components/ui/Button';
import { Grid } from '@/lib/grid/Grid';
import { TwoDRenderer } from '@/lib/grid/rendering/TwoDRenderer';
import { BaseSize, ObjectType } from '@/lib/grid/types';
import { EmpireService } from '@/lib/supabase/services/empireService';
import { useSession } from '@/hooks/useSession';
import { AssetManager } from '@/lib/assets/AssetManager';
import { motion } from 'framer-motion';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function Mining() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef<Grid | null>(null);
  const rendererRef = useRef<TwoDRenderer | null>(null);
  const { session } = useSession();
  const [empire, setEmpire] = useState<any>(null);
  const [placedObjects, setPlacedObjects] = useState<any[]>([]);
  const [totalProduction, setTotalProduction] = useState(0);
  const [loading, setLoading] = useState(true);

  // Initialize grid and renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const grid = new Grid(BaseSize.ROOM);
    gridRef.current = grid;

    const renderer = new TwoDRenderer();
    rendererRef.current = renderer;

    const tileSize = 40;
    const gridWidth = grid.getDimensions().width;
    const gridHeight = grid.getDimensions().height;

    renderer.initialize({
      canvas: canvasRef.current,
      width: gridWidth * tileSize + 100,
      height: gridHeight * tileSize + 100,
      tileSize,
      offsetX: 50,
      offsetY: 50,
    });

    renderer.renderGrid(grid.getState());

    return () => {
      renderer.cleanup();
    };
  }, []);

  // Load empire and placed objects
  useEffect(() => {
    if (!session?.player_id) return;

    const loadEmpireData = async () => {
      try {
        setLoading(true);
        const [empireData, objectsData] = await Promise.all([
          EmpireService.getEmpireByPlayerId(session.player_id),
          EmpireService.getPlacedObjects(session.player_id),
        ]);

        setEmpire(empireData);
        setPlacedObjects(objectsData || []);

        // Calculate total production
        let production = 0;
        if (objectsData && Array.isArray(objectsData)) {
          for (const obj of objectsData) {
            if ((obj as any).status === 'active') {
              production += 10; // Base production per active building
            }
          }
        }
        setTotalProduction(production);

        // Render placed objects on grid
        if (gridRef.current && rendererRef.current && objectsData && Array.isArray(objectsData)) {
          for (const obj of objectsData) {
            gridRef.current.placeObject({
              type: (obj as any).building_key as ObjectType,
              position: { x: (obj as any).grid_x, y: (obj as any).grid_y },
              rotation: 0,
              layer: 0,
              ownerId: session.player_id,
            });
          }
          rendererRef.current.renderGrid(gridRef.current.getState());
        }
      } catch (error) {
        console.error('Failed to load empire data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmpireData();
  }, [session?.player_id]);

  if (loading) {
    return (
      <>
        <PageLayout title="Mining">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400">Loading your empire...</div>
          </div>
        </PageLayout>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <PageLayout title="Mining">
        {/* Resource Balances */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src={AssetManager.resources.FREECOIN}
              alt="Coins"
              className="w-10 h-10 mx-auto mb-2"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.p 
              className="text-white font-bold text-lg neon-text"
              animate={{ 
                textShadow: ['0 0 10px #00d4ff', '0 0 20px #00d4ff', '0 0 10px #00d4ff']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={0} />
            </motion.p>
            <p className="text-gray-400 text-xs">Coins</p>
          </motion.div>
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src={AssetManager.resources.PREMIUM_TOKEN}
              alt="Gems"
              className="w-10 h-10 mx-auto mb-2"
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />
            <motion.p 
              className="text-white font-bold text-lg"
              animate={{ 
                textShadow: ['0 0 10px #9d4edd', '0 0 20px #9d4edd', '0 0 10px #9d4edd']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={0} />
            </motion.p>
            <p className="text-gray-400 text-xs">Premium</p>
          </motion.div>
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src={AssetManager.resources.BATTERY}
              alt="Energy"
              className="w-10 h-10 mx-auto mb-2"
              animate={{ 
                scale: [1, 1.1, 1],
                filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.p 
              className="text-white font-bold text-lg"
              animate={{ 
                textShadow: ['0 0 10px #00ff88', '0 0 20px #00ff88', '0 0 10px #00ff88']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={100} />
            </motion.p>
            <p className="text-gray-400 text-xs">Energy</p>
          </motion.div>
        </motion.div>

        {/* Production Stats */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <p className="text-gray-400 text-xs mb-1">Production</p>
            <motion.p 
              className="text-green-400 font-bold text-lg neon-text"
              animate={{ 
                textShadow: ['0 0 10px #00ff88', '0 0 30px #00ff88', '0 0 10px #00ff88']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              +<AnimatedCounter value={totalProduction} />/sec
            </motion.p>
          </motion.div>
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <p className="text-gray-400 text-xs mb-1">Storage</p>
            <motion.p 
              className="text-blue-400 font-bold text-lg"
              animate={{ 
                textShadow: ['0 0 10px #0066ff', '0 0 20px #0066ff', '0 0 10px #0066ff']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={0} />
            </motion.p>
          </motion.div>
          <motion.div 
            className="cyber-card p-3 text-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <p className="text-gray-400 text-xs mb-1">Power</p>
            <motion.p 
              className="text-yellow-400 font-bold text-lg"
              animate={{ 
                textShadow: ['0 0 10px #facc15', '0 0 20px #facc15', '0 0 10px #facc15']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AnimatedCounter value={0} />
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Empire Grid */}
        <motion.div 
          className="glass-panel p-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2 
            className="text-xl font-bold text-white neon-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Your Empire
          </motion.h2>
          <div className="flex justify-center bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl overflow-hidden border border-cyan-500/20">
            <canvas
              ref={canvasRef}
              className="max-w-full"
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="grid grid-cols-4 gap-2 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="primary" className="w-full" size="sm">
              <img src={AssetManager.actions.build} alt="" className="w-4 h-4 mr-1" />
              Build
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="secondary" className="w-full" size="sm">
              <img src={AssetManager.actions.move} alt="" className="w-4 h-4 mr-1" />
              Move
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="secondary" className="w-full" size="sm">
              <img src={AssetManager.actions.upgrade} alt="" className="w-4 h-4 mr-1" />
              Upgrade
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="success" className="w-full" size="sm">
              <img src={AssetManager.actions.collect} alt="" className="w-4 h-4 mr-1" />
              Collect
            </Button>
          </motion.div>
        </motion.div>

        {/* Building Selection */}
        <motion.div 
          className="glass-panel p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.h2 
            className="text-xl font-bold text-white neon-text mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Build Structures
          </motion.h2>
          <div className="grid grid-cols-3 gap-3">
            <motion.button 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={AssetManager.buildings.FACTORY} alt="Factory" className="w-14 h-14 mx-auto mb-2" />
              </motion.div>
              <div className="text-white text-sm font-medium">Factory</div>
              <div className="text-yellow-400 text-xs flex items-center justify-center gap-1">
                <img src={AssetManager.resources.FREECOIN} alt="" className="w-3 h-3" />
                100
              </div>
            </motion.button>
            <motion.button 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={AssetManager.buildings.POWER_STATION} alt="Power Station" className="w-14 h-14 mx-auto mb-2" />
              </motion.div>
              <div className="text-white text-sm font-medium">Power Station</div>
              <div className="text-yellow-400 text-xs flex items-center justify-center gap-1">
                <img src={AssetManager.resources.FREECOIN} alt="" className="w-3 h-3" />
                250
              </div>
            </motion.button>
            <motion.button 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={AssetManager.buildings.WAREHOUSE} alt="Warehouse" className="w-14 h-14 mx-auto mb-2" />
              </motion.div>
              <div className="text-white text-sm font-medium">Warehouse</div>
              <div className="text-yellow-400 text-xs flex items-center justify-center gap-1">
                <img src={AssetManager.resources.FREECOIN} alt="" className="w-3 h-3" />
                500
              </div>
            </motion.button>
            <motion.button 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={AssetManager.buildings.RESEARCH_LAB} alt="Research Lab" className="w-14 h-14 mx-auto mb-2" />
              </motion.div>
              <div className="text-white text-sm font-medium">Research Lab</div>
              <div className="text-yellow-400 text-xs flex items-center justify-center gap-1">
                <img src={AssetManager.resources.FREECOIN} alt="" className="w-3 h-3" />
                750
              </div>
            </motion.button>
            <motion.button 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={AssetManager.buildings.GARAGE} alt="Garage" className="w-14 h-14 mx-auto mb-2" />
              </motion.div>
              <div className="text-white text-sm font-medium">Garage</div>
              <div className="text-yellow-400 text-xs flex items-center justify-center gap-1">
                <img src={AssetManager.resources.FREECOIN} alt="" className="w-3 h-3" />
                1000
              </div>
            </motion.button>
            <motion.button 
              className="cyber-card p-3 text-center"
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src={AssetManager.buildings.WORKSHOP} alt="Workshop" className="w-14 h-14 mx-auto mb-2" />
              </motion.div>
              <div className="text-white text-sm font-medium">Workshop</div>
              <div className="text-yellow-400 text-xs flex items-center justify-center gap-1">
                <img src={AssetManager.resources.FREECOIN} alt="" className="w-3 h-3" />
                1500
              </div>
            </motion.button>
          </div>
        </motion.div>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
