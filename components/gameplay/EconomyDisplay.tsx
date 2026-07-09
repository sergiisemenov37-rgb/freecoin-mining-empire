'use client';

/**
 * Economy Display
 * Displays currency balance and purchasing options
 */

import { useEffect, useState } from 'react';
import { EconomySystem } from '@/lib/gameplay/EconomySystem';
import { EmpireSystem } from '@/lib/gameplay/EmpireSystem';
import { CurrencyType } from '@/lib/gameplay/types';

interface EconomyDisplayProps {
  economySystem: EconomySystem;
  empireSystem: EmpireSystem;
  empireId: string | null;
}

export default function EconomyDisplay({ economySystem, empireSystem, empireId }: EconomyDisplayProps) {
  const [freecoinBalance, setFreecoinBalance] = useState(0);
  const [isShopOpen, setIsShopOpen] = useState(false);

  useEffect(() => {
    if (!empireId) return;

    const updateBalance = () => {
      setFreecoinBalance(empireSystem.getCurrencyBalance(empireId, CurrencyType.FREECOIN));
    };

    updateBalance();

    // Subscribe to currency events
    economySystem.on('currency_earned' as any, updateBalance);
    economySystem.on('currency_spent' as any, updateBalance);

    return () => {
      economySystem.off('currency_earned' as any, updateBalance);
      economySystem.off('currency_spent' as any, updateBalance);
    };
  }, [economySystem, empireSystem, empireId]);

  const handlePurchase = (hardwareType: string) => {
    if (!empireId) return;
    economySystem.purchaseHardware(empireId, hardwareType);
    setIsShopOpen(false);
  };

  const hardwareItems = [
    { type: 'gpu_basic', name: 'Basic GPU', price: 50 },
    { type: 'gpu_standard', name: 'Standard GPU', price: 100 },
    { type: 'asic_basic', name: 'Basic ASIC', price: 75 },
    { type: 'battery_small', name: 'Small Battery', price: 30 },
    { type: 'solar_basic', name: 'Basic Solar Panel', price: 40 },
    { type: 'cooling_fan', name: 'Cooling Fan', price: 20 },
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Economy</h3>
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 font-bold">{freecoinBalance.toFixed(2)} FC</span>
          <button
            onClick={() => setIsShopOpen(!isShopOpen)}
            className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-sm"
          >
            Shop
          </button>
        </div>
      </div>

      {isShopOpen && (
        <div className="border-t border-gray-700 pt-4 mt-4">
          <h4 className="text-md font-semibold text-white mb-3">Hardware Shop</h4>
          <div className="grid grid-cols-2 gap-2">
            {hardwareItems.map((item) => (
              <button
                key={item.type}
                onClick={() => handlePurchase(item.type)}
                disabled={freecoinBalance < item.price}
                className={`p-3 rounded border ${
                  freecoinBalance >= item.price
                    ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                    : 'bg-gray-800 border-gray-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-white font-semibold text-sm">{item.name}</div>
                <div className="text-yellow-400 text-sm">{item.price} FC</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
