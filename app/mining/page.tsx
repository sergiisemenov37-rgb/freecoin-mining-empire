'use client';

import { useEffect, useRef, useState } from 'react';
import { PageLayout } from '@/components/ui/PageLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BottomNavigation } from '@/components/ui/BottomNavigation';
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
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <img src={AssetManager.resources.FREECOIN} alt="Coins" className="w-10 h-10" />
                </motion.div>
                <div>
                  <p className="text-gray-400 text-xs">Coins</p>
                  <p className="text-white font-bold text-lg"><AnimatedCounter value={0} /></p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                >
                  <img src={AssetManager.resources.PREMIUM_TOKEN} alt="Gems" className="w-10 h-10" />
                </motion.div>
                <div>
                  <p className="text-gray-400 text-xs">Gems</p>
                  <p className="text-white font-bold text-lg"><AnimatedCounter value={0} /></p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img src={AssetManager.resources.BATTERY} alt="Energy" className="w-10 h-10" />
                </motion.div>
                <div>
                  <p className="text-gray-400 text-xs">Energy</p>
                  <p className="text-white font-bold text-lg"><AnimatedCounter value={100} /></p>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Production Stats */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring' }}
              >
                <p className="text-gray-400 text-xs">Production Rate</p>
                <motion.p 
                  className="text-green-400 font-bold text-lg"
                  animate={{ 
                    textShadow: ['0 0 10px rgba(74, 222, 128, 0.5)', '0 0 20px rgba(74, 222, 128, 0.8)', '0 0 10px rgba(74, 222, 128, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  +<AnimatedCounter value={totalProduction} />/sec
                </motion.p>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring' }}
              >
                <p className="text-gray-400 text-xs">Active Buildings</p>
                <p className="text-white font-bold text-lg"><AnimatedCounter value={placedObjects.filter((o: any) => o.status === 'active').length} /></p>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring' }}
              >
                <p className="text-gray-400 text-xs">Empire Level</p>
                <motion.p 
                  className="text-yellow-400 font-bold text-lg"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    textShadow: ['0 0 10px rgba(250, 204, 21, 0.5)', '0 0 20px rgba(250, 204, 21, 0.8)', '0 0 10px rgba(250, 204, 21, 0.5)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <AnimatedCounter value={empire?.level || 1} />
                </motion.p>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Empire Grid */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Your Empire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center bg-gray-900 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="max-w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Building Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Build</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              <motion.button 
                className="p-3 bg-white/5 backdrop-blur border border-white/10 rounded-lg hover:border-cyan-500/50 transition-colors"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img src={AssetManager.buildings.FACTORY} alt="Factory" className="w-12 h-12 mx-auto mb-1" />
                </motion.div>
                <div className="text-white text-xs">Factory</div>
                <div className="text-yellow-400 text-xs">100 coins</div>
              </motion.button>
              <motion.button 
                className="p-3 bg-white/5 backdrop-blur border border-white/10 rounded-lg hover:border-cyan-500/50 transition-colors"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img src={AssetManager.buildings.POWER_STATION} alt="Mine" className="w-12 h-12 mx-auto mb-1" />
                </motion.div>
                <div className="text-white text-xs">Mine</div>
                <div className="text-yellow-400 text-xs">250 coins</div>
              </motion.button>
              <motion.button 
                className="p-3 bg-white/5 backdrop-blur border border-white/10 rounded-lg hover:border-cyan-500/50 transition-colors"
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <img src={AssetManager.buildings.WAREHOUSE} alt="Battery" className="w-12 h-12 mx-auto mb-1" />
                </motion.div>
                <div className="text-white text-xs">Battery</div>
                <div className="text-yellow-400 text-xs">500 coins</div>
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
      <BottomNavigation />
    </>
  );
}
