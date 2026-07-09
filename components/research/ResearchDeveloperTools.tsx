'use client';

/**
 * Research Developer Tools
 * Developer tool with tree visualization for research nodes, queue, and laboratories
 */

import { useState, useEffect, useRef } from 'react';
import { ResearchSystem } from '@/lib/research/ResearchSystem';
import { ResearchTreeNode } from '@/lib/research/ResearchGraph';

interface ResearchDeveloperToolsProps {
  researchSystem: ResearchSystem;
}

export default function ResearchDeveloperTools({ researchSystem }: ResearchDeveloperToolsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tree' | 'queue' | 'points' | 'labs'>('tree');
  
  // Tree state
  const [researchTree, setResearchTree] = useState<ResearchTreeNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  // Queue state
  const [researchQueue, setResearchQueue] = useState<any[]>([]);
  
  // Points state
  const [researchPoints, setResearchPoints] = useState<any>(null);
  
  // Labs state
  const [laboratories, setLaboratories] = useState<any[]>([]);

  const refreshInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refresh = () => {
      setResearchTree(researchSystem.getResearchTree());
      setResearchQueue(researchSystem.getResearchQueue());
      setResearchPoints(researchSystem.getPoints());
      setLaboratories(researchSystem.getAllLaboratories());
    };

    refresh();
    refreshInterval.current = setInterval(refresh, 500);

    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [researchSystem]);

  const handleSelectNode = (node: any) => {
    setSelectedNode(node);
  };

  const handleToggleExpand = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleStartResearch = () => {
    if (selectedNode) {
      researchSystem.startResearch(selectedNode.id);
    }
  };

  const handleCancelResearch = () => {
    if (selectedNode) {
      researchSystem.cancelResearch(selectedNode.id);
    }
  };

  const handleAddLaboratory = () => {
    const labId = `lab_${Date.now()}`;
    researchSystem.addLaboratory({
      id: labId,
      name: `Laboratory ${laboratories.length + 1}`,
      level: 1,
      maxLevel: 10,
      baseSpeedMultiplier: 1.2,
      currentSpeedMultiplier: 1.2,
      maxParallelResearch: 1,
      currentParallelResearch: 0,
      categoryBonus: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  };

  const handleUpgradeLaboratory = (labId: string) => {
    researchSystem.upgradeLaboratory(labId);
  };

  const getNodeStateColor = (state: string) => {
    switch (state) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'available': return 'bg-blue-500';
      case 'locked': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const renderTreeNode = (treeNode: ResearchTreeNode, depth: number = 0): React.ReactElement => {
    const node = treeNode.node;
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = treeNode.children.length > 0;

    return (
      <div key={node.id} style={{ marginLeft: depth * 20 }}>
        <div
          onClick={() => handleSelectNode(node)}
          className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
            selectedNode?.id === node.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand(node.id);
              }}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          <span className={`w-3 h-3 rounded-full ${getNodeStateColor(node.state)}`} />
          <span className="text-white text-sm">{node.name}</span>
          <span className="text-gray-400 text-xs">{node.category}</span>
        </div>
        {isExpanded && treeNode.children.map(child => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold z-50"
      >
        Research Tools
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Research Developer Tools</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('tree')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'tree' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Tree
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'queue' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Queue
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'points' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Points
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`px-4 py-2 text-sm font-semibold ${
              activeTab === 'labs' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Labs
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {activeTab === 'tree' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Research Tree</h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {researchTree.map(treeNode => renderTreeNode(treeNode))}
                  </div>
                </div>

                {selectedNode && (
                  <div className="bg-gray-800 rounded p-4">
                    <h3 className="text-lg font-bold text-white mb-3">Node Details</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="text-gray-400 text-sm">Name</label>
                        <div className="text-white">{selectedNode.name}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Category</label>
                        <div className="text-white">{selectedNode.category}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">State</label>
                        <div className="text-white">{selectedNode.state}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Cost</label>
                        <div className="text-white">{selectedNode.cost?.researchPoints || 0} points</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Research Time</label>
                        <div className="text-white">{(selectedNode.researchTime / 1000).toFixed(0)}s</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Dependencies</label>
                        <div className="text-white">{selectedNode.dependencies?.length || 0}</div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Unlocks</label>
                        <div className="text-white">{selectedNode.unlocks?.length || 0}</div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {selectedNode.state === 'available' && (
                          <button
                            onClick={handleStartResearch}
                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded text-sm font-semibold"
                          >
                            Start Research
                          </button>
                        )}
                        {selectedNode.state === 'in_progress' && (
                          <button
                            onClick={handleCancelResearch}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded text-sm font-semibold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'queue' && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Research Queue</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {researchQueue.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">No items in queue</div>
                  ) : (
                    researchQueue.map((item) => (
                      <div key={item.queueId} className="p-3 bg-gray-700 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{item.nodeId}</span>
                          <span className={`text-xs px-2 py-1 rounded ${item.isPaused ? 'bg-orange-600' : 'bg-green-600'}`}>
                            {item.isPaused ? 'Paused' : 'Active'}
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">Priority: {item.priority}</div>
                        <div className="text-gray-400 text-xs mt-1">
                          Est. completion: {new Date(item.estimatedCompletionTime).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'points' && researchPoints && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Research Points</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Total</label>
                    <div className="text-2xl font-bold text-white">{researchPoints.total.toFixed(0)}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Available</label>
                    <div className="text-2xl font-bold text-green-400">{researchPoints.available.toFixed(0)}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Spent</label>
                    <div className="text-2xl font-bold text-red-400">{researchPoints.spent.toFixed(0)}</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Earned</label>
                    <div className="text-2xl font-bold text-blue-400">{researchPoints.earned.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'labs' && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleAddLaboratory}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded font-semibold"
                >
                  + New Laboratory
                </button>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Laboratories</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {laboratories.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">No laboratories</div>
                  ) : (
                    laboratories.map((lab) => (
                      <div key={lab.id} className="p-3 bg-gray-700 rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">{lab.name}</span>
                          <span className="text-gray-400 text-xs">Level {lab.level}/{lab.maxLevel}</span>
                        </div>
                        <div className="text-gray-400 text-sm">Speed: {lab.currentSpeedMultiplier.toFixed(2)}x</div>
                        <div className="text-gray-400 text-sm">Parallel: {lab.maxParallelResearch}</div>
                        {lab.level < lab.maxLevel && (
                          <button
                            onClick={() => handleUpgradeLaboratory(lab.id)}
                            className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm"
                          >
                            Upgrade
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded p-4">
                <h3 className="text-lg font-bold text-white mb-3">Total Bonuses</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Speed Multiplier</label>
                    <div className="text-2xl font-bold text-white">{researchSystem.getTotalSpeedMultiplier().toFixed(2)}x</div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Parallel Research</label>
                    <div className="text-2xl font-bold text-white">{researchSystem.getTotalParallelResearch()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
