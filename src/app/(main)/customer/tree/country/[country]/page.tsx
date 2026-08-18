'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { CustomerService } from '@/services/customer';
import { CustomerDto } from '@/constants/customer';
import {
  ChevronRightIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  XMarkIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Tree from 'react-d3-tree';
import type { TreeNodeDatum } from 'react-d3-tree';

const customerService = new CustomerService();

interface TreeNode extends CustomerDto {
  children?: TreeNode[];
  loading?: boolean;
  expanded?: boolean;
  childrenLoaded?: boolean;
}

const tierColorMap: Record<number, string> = {
  1: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300',
  2: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300',
  3: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300',
  4: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300',
  5: 'bg-gradient-to-r from-pink-100 to-pink-200 text-pink-800 border-pink-300',
};

function cloneTree(node: TreeNode): TreeNode {
  return { ...node, children: node.children?.map(cloneTree) };
}

type DrawAction = {
  type: 'pen' | 'eraser';
  points: { x: number; y: number }[];
  color?: string;
};

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#1e293b',
  '#64748b', '#000000',
];

const SALESPERSON_COLORS = [
  '#FF6B6B', '#48DBFB', '#10AC84',  '#FF6384','#36A2EB',
  '#341F97', '#FF9FF3', '#00D2D3', '#EE5A24', '#F368E0',
  '#FFC048', '#0ABDE3', '#4BC0C0',  '#FF9F43', '#FECA57','#5F27CD',
];

function stringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// ---------- 工具函数 ----------
function updateTreeNode(root: TreeNode, targetId: string, updater: (node: TreeNode) => void): TreeNode {
  if (root.id === targetId) {
    const newRoot = { ...root };
    updater(newRoot);
    return newRoot;
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map(child => updateTreeNode(child, targetId, updater)),
    };
  }
  return root;
}

function collectNodesToLoad(root: TreeNode, maxDepth: number = Infinity): TreeNode[] {
  const result: TreeNode[] = [];
  const queue: { node: TreeNode; depth: number }[] = [{ node: root, depth: 0 }];
  while (queue.length > 0) {
    const { node, depth } = queue.shift()!;
    if (!node.childrenLoaded && !node.loading && depth < maxDepth) {
      result.push(node);
    }
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        queue.push({ node: child, depth: depth + 1 });
      }
    }
  }
  return result;
}
// ----------------------------------

export default function CountryTreePage() {
  const params = useParams();
  const router = useRouter();
  const country = decodeURIComponent((params?.country as string) || '');
  const effectiveRootId = `country:${country}`;

  const [loading, setLoading] = useState(true);
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [createdAtFrom, setCreatedAtFrom] = useState('');
  const [createdAtTo, setCreatedAtTo] = useState('');
  const [updatedAtFrom, setUpdatedAtFrom] = useState('');
  const [updatedAtTo, setUpdatedAtTo] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<'select' | 'pen' | 'eraser'>('select');
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isSavingRef = useRef(false);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [treeViewState, setTreeViewState] = useState({
    translate: { x: 200, y: 250 },
    scale: 1,
  });

  const [loadProgress, setLoadProgress] = useState<number | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  const treeViewStateRef = useRef(treeViewState);
  const rafIdRef = useRef<number | null>(null);
  const pendingViewStateRef = useRef<{ translate: { x: number; y: number }; scale: number } | null>(null);

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [salespersonColorMap, setSalespersonColorMap] = useState<Record<string, string>>({});
  const [allSalespersons, setAllSalespersons] = useState<string[]>([]);

  const isExpandingRef = useRef(false);
  const rootRef = useRef(root);
  useEffect(() => {
    rootRef.current = root;
  }, [root]);

  useEffect(() => {
    treeViewStateRef.current = treeViewState;
  }, [treeViewState]);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    offscreenCanvasRef.current = canvas;
    offscreenCtxRef.current = canvas.getContext('2d');
  }, []);

  const screenToTree = useCallback((screenX: number, screenY: number) => {
    const { translate, scale } = treeViewStateRef.current;
    return {
      x: (screenX - translate.x) / scale,
      y: (screenY - translate.y) / scale,
    };
  }, []);

  const treeToScreen = useCallback((treeX: number, treeY: number) => {
    const { translate, scale } = treeViewStateRef.current;
    return {
      x: treeX * scale + translate.x,
      y: treeY * scale + translate.y,
    };
  }, []);

  // ---------- 绘图核心 ----------
  const drawHistoryToOffscreen = useCallback(() => {
    const offCanvas = offscreenCanvasRef.current;
    const ctx = offscreenCtxRef.current;
    const canvas = canvasRef.current;
    if (!offCanvas || !ctx || !canvas) return;
    offCanvas.width = canvas.width;
    offCanvas.height = canvas.height;
    ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);

    const { scale } = treeViewStateRef.current;
    for (const action of history) {
      if (action.points.length < 2) continue;
      ctx.beginPath();
      const start = treeToScreen(action.points[0].x, action.points[0].y);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < action.points.length; i++) {
        const pt = treeToScreen(action.points[i].x, action.points[i].y);
        ctx.lineTo(pt.x, pt.y);
      }
      if (action.type === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = action.color || selectedColor;
        ctx.lineWidth = 3 * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 2 * scale;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 16 * scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }, [history, treeToScreen, selectedColor]);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const offCanvas = offscreenCanvasRef.current;
    if (!canvas || !ctx || !offCanvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(offCanvas, 0, 0);
    if (currentPoints.length >= 2) {
      ctx.beginPath();
      const start = treeToScreen(currentPoints[0].x, currentPoints[0].y);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < currentPoints.length; i++) {
        const pt = treeToScreen(currentPoints[i].x, currentPoints[i].y);
        ctx.lineTo(pt.x, pt.y);
      }
      if (tool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = 3 * treeViewStateRef.current.scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 2 * treeViewStateRef.current.scale;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 16 * treeViewStateRef.current.scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  }, [currentPoints, tool, selectedColor, treeToScreen]);

  useEffect(() => {
    drawHistoryToOffscreen();
    redrawAll();
  }, [history, treeViewState, drawHistoryToOffscreen, redrawAll]);

  // ---------- ★ 主数据加载（合并展开状态与根节点加载，确保展开状态就绪） ----------
  useEffect(() => {
    if (!country) {
      setRoot(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // 并行加载展开状态和根节点数据
        const queryParams: any = {
          country,
          parentId: 'null',
          pageSize: 100,
        };
        if (createdAtFrom) queryParams.createdAtFrom = createdAtFrom;
        if (createdAtTo) queryParams.createdAtTo = createdAtTo;
        if (updatedAtFrom) queryParams.updatedAtFrom = updatedAtFrom;
        if (updatedAtTo) queryParams.updatedAtTo = updatedAtTo;

        const [stateRes, customersRes] = await Promise.all([
          customerService.getTreeState(effectiveRootId),
          customerService.queryCustomers(queryParams),
        ]);

        // 处理展开状态
        let loadedExpandedIds = new Set<string>();
        if (stateRes.msg === 'success' && stateRes.data) {
          const ids = stateRes.data.expandedNodeIds || [];
          ids.forEach((id: string) => loadedExpandedIds.add(id));
          loadedExpandedIds.delete('__country_root__');
          setExpandedIds(loadedExpandedIds);
          setHistory(stateRes.data.drawingHistory || []);
          if (stateRes.data.viewState) setTreeViewState(stateRes.data.viewState);
        }

        // 处理客户数据
        let allData: any[] = [];
        if (customersRes.msg === 'success' && customersRes.data.length > 0) {
          allData = customersRes.data;
        } else {
          // 若查询结果为空，尝试不带日期等条件再查一次
          const fallbackParams: any = { country, pageSize: 100 };
          if (createdAtFrom) fallbackParams.createdAtFrom = createdAtFrom;
          if (createdAtTo) fallbackParams.createdAtTo = createdAtTo;
          if (updatedAtFrom) fallbackParams.updatedAtFrom = updatedAtFrom;
          if (updatedAtTo) fallbackParams.updatedAtTo = updatedAtTo;
          const fallbackRes = await customerService.queryCustomers(fallbackParams);
          if (fallbackRes.msg === 'success' && fallbackRes.data.length > 0) {
            allData = fallbackRes.data;
          }
        }

        if (allData.length > 0) {
          // 收集销售员
          const salesNames = Array.from(
            new Set(allData.map((c: any) => c.salesperson_name?.trim()).filter(Boolean))
          ) as string[];
          const colorMap: Record<string, string> = {};
          salesNames.forEach(name => {
            colorMap[name] = SALESPERSON_COLORS[stringHash(name) % SALESPERSON_COLORS.length];
          });
          setSalespersonColorMap(colorMap);
          setAllSalespersons(salesNames);

          // ★ 使用已加载的 loadedExpandedIds 设置节点展开状态
          const childrenNodes = allData.map((c) => ({
            ...c,
            children: undefined,
            expanded: loadedExpandedIds.has(c.id),
            loading: false,
            childrenLoaded: false,
          }));

          const virtualRoot: TreeNode = {
            id: '__country_root__',
            name: `🌍 ${country} (${childrenNodes.length}个客户)`,
            tier: 0,
            expanded: true,
            loading: false,
            childrenLoaded: true,
            children: childrenNodes,
          } as any;
          setRoot(virtualRoot);
        } else {
          setRoot(null);
        }
      } catch (e) {
        console.error('加载数据失败', e);
        setRoot(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [country, createdAtFrom, createdAtTo, updatedAtFrom, updatedAtTo, effectiveRootId]);

  // ---------- 子节点加载 ----------
  const fetchChildrenData = useCallback(async (parentId: string): Promise<TreeNode[]> => {
    try {
      const res = await customerService.getChildren(parentId);
      if (res.msg === 'success') {
        return res.data.map((c) => ({
          ...c,
          children: undefined,
          expanded: false,
          loading: false,
          childrenLoaded: false,
        }));
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  // ---------- 展开/折叠节点 ----------
  const toggleNode = useCallback(async (targetNode: TreeNode) => {
    if (tool !== 'select' || targetNode.id === '__country_root__') return;
    if (!root) return;
    if (targetNode.loading) return;

    if (targetNode.expanded && targetNode.childrenLoaded) {
      setRoot(prevRoot => {
        if (!prevRoot) return prevRoot;
        const newRoot = updateTreeNode(prevRoot, targetNode.id, (node) => {
          node.expanded = false;
        });
        setExpandedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetNode.id);
          return newSet;
        });
        return newRoot;
      });
      return;
    }

    setRoot(prevRoot => {
      if (!prevRoot) return prevRoot;
      return updateTreeNode(prevRoot, targetNode.id, (node) => {
        node.expanded = true;
        node.loading = true;
      });
    });

    if (!targetNode.childrenLoaded) {
      try {
        const children = await fetchChildrenData(targetNode.id);
        const childNames = Array.from(
          new Set(children.map(c => c.salesperson_name?.trim()).filter(Boolean))
        ) as string[];
        if (childNames.length > 0) {
          setSalespersonColorMap(prev => {
            const updated = { ...prev };
            childNames.forEach(name => {
              if (!updated[name]) {
                updated[name] = SALESPERSON_COLORS[stringHash(name) % SALESPERSON_COLORS.length];
              }
            });
            return updated;
          });
          setAllSalespersons(prev => Array.from(new Set([...prev, ...childNames])));
        }

        setRoot(prevRoot => {
          if (!prevRoot) return prevRoot;
          return updateTreeNode(prevRoot, targetNode.id, (node) => {
            node.children = children;
            node.loading = false;
            node.childrenLoaded = true;
          });
        });
      } catch (error) {
        console.error(error);
        setRoot(prevRoot => {
          if (!prevRoot) return prevRoot;
          return updateTreeNode(prevRoot, targetNode.id, (node) => {
            node.loading = false;
          });
        });
      }
    } else {
      setRoot(prevRoot => {
        if (!prevRoot) return prevRoot;
        return updateTreeNode(prevRoot, targetNode.id, (node) => {
          node.expanded = true;
          node.loading = false;
        });
      });
    }

    setExpandedIds(prev => new Set(prev).add(targetNode.id));
  }, [root, tool, fetchChildrenData]);

  // ---------- 展开全部（递归加载直到全部完成） ----------
  const expandAll = useCallback(async () => {
    if (!rootRef.current || isExpandingRef.current) return;
    isExpandingRef.current = true;
    setLoadProgress(0);

    const startTime = performance.now();

    let totalLoaded = 0;
    let round = 0;

    try {
      while (true) {
        round++;
        const currentRoot = rootRef.current;
        if (!currentRoot) break;

        const nodesToLoad = collectNodesToLoad(currentRoot);
        if (nodesToLoad.length === 0) {
          break;
        }

        const allNodeIds = new Set<string>();
        const collectAllIds = (node: TreeNode) => {
          allNodeIds.add(node.id);
          if (node.children) for (const child of node.children) collectAllIds(child);
        };
        collectAllIds(currentRoot);
        setExpandedIds(allNodeIds);

        setRoot(prevRoot => {
          if (!prevRoot) return prevRoot;
          const newRoot = { ...prevRoot };
          const markExpanded = (node: TreeNode) => {
            node.expanded = true;
            if (node.children) for (const child of node.children) markExpanded(child);
          };
          markExpanded(newRoot);
          return newRoot;
        });

        const batchSize = 10;
        for (let i = 0; i < nodesToLoad.length; i += batchSize) {
          const batch = nodesToLoad.slice(i, i + batchSize);
          const batchPromises = batch.map(async (node) => {
            try {
              const children = await fetchChildrenData(node.id);
              return { node, children };
            } catch (error) {
              console.error(`加载节点 ${node.id} 失败`, error);
              return { node, children: [] };
            }
          });

          const batchResults = await Promise.all(batchPromises);
          totalLoaded += batch.length;
          setLoadProgress(totalLoaded);

          setRoot(prevRoot => {
            if (!prevRoot) return prevRoot;
            let newRoot = { ...prevRoot };
            for (const { node, children } of batchResults) {
              newRoot = updateTreeNode(newRoot, node.id, (target) => {
                target.children = children;
                target.loading = false;
                target.childrenLoaded = true;
              });
            }
            return newRoot;
          });

          if (i + batchSize < nodesToLoad.length) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }

        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const finalRoot = rootRef.current;
      if (finalRoot) {
        const allNames = new Set<string>();
        const collectSalespersons = (node: TreeNode) => {
          if (node.salesperson_name?.trim()) allNames.add(node.salesperson_name.trim());
          if (node.children) for (const child of node.children) collectSalespersons(child);
        };
        collectSalespersons(finalRoot);
        setSalespersonColorMap(prev => {
          const updated = { ...prev };
          allNames.forEach(name => {
            if (!updated[name]) {
              updated[name] = SALESPERSON_COLORS[stringHash(name) % SALESPERSON_COLORS.length];
            }
          });
          return updated;
        });
        setAllSalespersons(Array.from(allNames));
      }

    } catch (error) {
      console.error('展开全部出错', error);
    } finally {
      setLoadProgress(null);
      isExpandingRef.current = false;
    }
  }, [fetchChildrenData]);

  // ---------- 业务员筛选时自动展开全部 ----------
  useEffect(() => {
    if (!salespersonFilter || !root) {
      setIsFilterLoading(false);
      return;
    }
    if (!isExpandingRef.current) {
      setIsFilterLoading(true);
      expandAll().finally(() => {
        setIsFilterLoading(false);
      });
    }
  }, [salespersonFilter, root, expandAll]);

  // ---------- 删除/复原 ----------
  const deleteNode = (nodeId: string) => {
    if (nodeId === '__country_root__') return;
    setDeletedIds(prev => new Set(prev).add(nodeId));
  };
  const restoreAll = () => setDeletedIds(new Set());

  const filterDeletedNodes = useCallback((node: TreeNode): TreeNode | null => {
    if (deletedIds.has(node.id)) return null;
    const children = node.children
      ?.map(child => filterDeletedNodes(child))
      .filter((child): child is TreeNode => child !== null) || [];
    return { ...node, children: children.length > 0 ? children : node.children };
  }, [deletedIds]);

  // ---------- 业务员过滤函数（保留虚拟根） ----------
  const filterBySalesperson = useCallback((node: TreeNode, salesperson: string): TreeNode | null => {
    if (!salesperson) return node;

    if (node.id === '__country_root__') {
      const filteredChildren = node.children
        ?.map(child => filterBySalesperson(child, salesperson))
        .filter((child): child is TreeNode => child !== null) || [];
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : undefined,
        expanded: true,
      };
    }

    const matches = (node.salesperson_name || '').trim() === salesperson;
    let filteredChildren: TreeNode[] = [];

    if (node.children && node.childrenLoaded) {
      for (const child of node.children) {
        const filtered = filterBySalesperson(child, salesperson);
        if (filtered) filteredChildren.push(filtered);
      }
    }

    if (node.childrenLoaded === false) {
      return null;
    }

    if (matches) {
      const newNode = { ...node };
      if (filteredChildren.length > 0) {
        newNode.children = filteredChildren;
      } else {
        newNode.children = undefined;
      }
      newNode.expanded = true;
      return newNode;
    }

    if (filteredChildren.length > 0) {
      const newNode = { ...node, children: filteredChildren, expanded: true };
      return newNode;
    }

    return null;
  }, []);

  // ---------- Tree 转换 ----------
  const convertToTreeDatum = (node: TreeNode): TreeNodeDatum => {
    if (!node.expanded) {
      return {
        name: node.name,
        attributes: { id: node.id, tier: node.tier, contact: node.contact_person || '', phone: node.phone || '', raw: node },
        children: undefined,
      };
    }
    const childNodes = node.children || [];
    const displayedChildren = childNodes.map((child) => convertToTreeDatum(child));
    return {
      name: node.name,
      attributes: { id: node.id, tier: node.tier, contact: node.contact_person || '', phone: node.phone || '', raw: node },
      children: displayedChildren.length > 0 ? displayedChildren : undefined,
    };
  };

  // ---------- 组合过滤 ----------
  const filteredRoot = useCallback(() => {
    if (!root) return null;

    let filtered = filterDeletedNodes(root);
    if (!filtered) return null;

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      const filterNode = (node: TreeNode): TreeNode | null => {
        const match = node.name.toLowerCase().includes(keyword);
        let filteredChildren: TreeNode[] = [];
        if (node.children) {
          filteredChildren = node.children
            .map((child) => filterNode(child))
            .filter((child): child is TreeNode => child !== null);
        }
        if (match || filteredChildren.length > 0) {
          const newNode = { ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children };
          if (!match && filteredChildren.length > 0) {
            newNode.expanded = true;
          } else if (match) {
            newNode.expanded = true;
          }
          return newNode;
        }
        return null;
      };
      filtered = filterNode(filtered);
      if (!filtered) return null;
    }

    if (salespersonFilter && !isFilterLoading) {
      filtered = filterBySalesperson(filtered, salespersonFilter);
    }

    return filtered;
  }, [root, filterDeletedNodes, searchKeyword, salespersonFilter, filterBySalesperson, isFilterLoading]);

  const treeData = filteredRoot() ? convertToTreeDatum(filteredRoot()!) : null;

  // ★★★ 修改点：节点名称点击 → 新窗口打开 ★★★
  const renderCustomNode = ({ nodeDatum }: any) => {
    const raw = nodeDatum.attributes.raw as TreeNode;
    const isVirtual = raw.id === '__country_root__';
    const hasChildren = raw.children && raw.children.length > 0;
    const isExpanded = raw.expanded;

    const salespersonName = raw.salesperson_name?.trim();
    const salespersonColor = salespersonName ? salespersonColorMap[salespersonName] : undefined;
    const bgStyle = salespersonColor
      ? {
          background: `linear-gradient(135deg, ${salespersonColor}40, ${salespersonColor}70)`,
          borderColor: salespersonColor,
          borderWidth: '2px',
        }
      : {
          background: 'linear-gradient(to bottom right, white, #f9fafb)',
          borderColor: '#e5e7eb',
        };

    const replyStatus = raw.reply_status;
    const isReplied = replyStatus === 'REPLIED';
    const statusColor = isReplied ? 'bg-green-500' : 'bg-gray-300';
    const statusLabel = isReplied ? '有回复' : '无回复';

    return (
      <foreignObject width={240} height={58} x={-120} y={-29} style={{ overflow: 'visible' }}>
        <div
          className={`flex items-center gap-2 py-1.5 px-3 rounded-2xl shadow-lg border transition-all duration-200 hover:shadow-xl hover:scale-105 group ${
            raw.loading ? 'opacity-60' : ''
          } text-sm cursor-pointer relative`}
          style={{
            minWidth: '120px',
            whiteSpace: 'nowrap',
            ...bgStyle,
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isVirtual) return;
            toggleNode(raw);
          }}
        >
          <span className="w-5 h-5 flex items-center justify-center text-gray-400 flex-shrink-0">
            {raw.loading ? (
              <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : isVirtual ? (
              <span>🌍</span>
            ) : hasChildren ? (
              <ChevronRightIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
            ) : (
              <BuildingOfficeIcon className="w-4 h-4 text-gray-300" />
            )}
          </span>

          <span
            className="text-blue-700 hover:text-blue-900 font-semibold truncate max-w-[80px] flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              if (tool === 'select' && !isVirtual) {
                // ★★★ 新窗口打开 ★★★
                window.open(`/customer/view/${raw.id}`, '_blank');
              }
            }}
          >
            {raw.name}
          </span>

          {!isVirtual && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${tierColorMap[raw.tier] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              T{raw.tier}
            </span>
          )}

          {!isVirtual && raw.reply_status && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`}></span>
              <span className="text-xs text-gray-600">{statusLabel}</span>
            </span>
          )}

          {!isVirtual && (
            <button
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md z-10"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`确定要删除客户“${raw.name}”及其所有下级吗？`)) {
                  deleteNode(raw.id);
                }
              }}
              title="删除此节点"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
          )}
        </div>
      </foreignObject>
    );
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const toolbarHeight = 56;
    canvas.width = rect.width;
    canvas.height = rect.height - toolbarHeight;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height - toolbarHeight + 'px';
    drawHistoryToOffscreen();
    redrawAll();
  }, [drawHistoryToOffscreen, redrawAll]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => resizeCanvas());
    observer.observe(container);
    resizeCanvas();
    return () => observer.disconnect();
  }, [resizeCanvas]);

  // Canvas 事件
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool === 'select') return;
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    const treePt = screenToTree(x, y);
    setCurrentPoints([treePt]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'select') return;
    const { x, y } = getCanvasCoords(e);
    const treePt = screenToTree(x, y);
    setCurrentPoints((prev) => [...prev, treePt]);
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === 'select') return;
    setIsDrawing(false);
    if (currentPoints.length >= 2) {
      setHistory((prev) => [
        ...prev,
        {
          type: tool,
          points: currentPoints,
          color: tool === 'pen' ? selectedColor : undefined,
        },
      ]);
    }
    setCurrentPoints([]);
  };

  const undo = () => {
    if (history.length === 0) return;
    setHistory((prev) => prev.slice(0, -1));
  };

  const clearAll = () => {
    setHistory([]);
  };

  const handleTreeUpdate = useCallback((state: any) => {
    const px = state.translate?.x ?? 0;
    const py = state.translate?.y ?? 0;
    const scale = state.zoom ?? 1;
    pendingViewStateRef.current = { translate: { x: px, y: py }, scale };
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingViewStateRef.current) {
          setTreeViewState(pendingViewStateRef.current);
          pendingViewStateRef.current = null;
        }
        rafIdRef.current = null;
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  // ---------- 保存展开状态（防抖） ----------
  const saveState = useCallback(async () => {
    if (!effectiveRootId || isSavingRef.current) return;
    isSavingRef.current = true;
    setSaveStatus('saving');
    try {
      const expandedNodeIds = root ? collectExpandedIds(root) : [];
      await customerService.saveTreeState({
        rootId: effectiveRootId,
        expandedNodeIds,
        drawingHistory: history,
        viewState: treeViewState,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('保存失败', e);
      setSaveStatus('idle');
    } finally {
      isSavingRef.current = false;
    }
  }, [effectiveRootId, root, history, treeViewState]);

  const collectExpandedIds = useCallback((node: TreeNode): string[] => {
    let ids: string[] = [];
    if (node.expanded && node.id !== '__country_root__') ids.push(node.id);
    if (node.children) for (const child of node.children) ids = ids.concat(collectExpandedIds(child));
    return ids;
  }, []);

  const saveNow = useCallback(async () => {
    setIsSaving(true);
    try { await saveState(); } catch (e) {}
    finally { setIsSaving(false); }
  }, [saveState]);

  const saveStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (saveStateTimerRef.current) clearTimeout(saveStateTimerRef.current);
    saveStateTimerRef.current = setTimeout(saveState, 800);
    return () => { if (saveStateTimerRef.current) clearTimeout(saveStateTimerRef.current); };
  }, [saveState]);

  // ---------- 全屏 ----------
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => resizeCanvas(), 50);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // ---------- 渲染 ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">加载中...</div>
      </div>
    );
  }

  if (!root) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">暂无{country}的客户数据</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/80 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800">{country} 客户关系图</h1>
          <span className="text-sm text-gray-400 ml-auto">点击节点展开/折叠</span>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索客户..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={restoreAll}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition shadow-sm"
            title="恢复所有被删除的节点"
          >
            <ArrowPathIcon className="w-4 h-4" />
            复原
          </button>
        </div>

        {/* 筛选栏 */}
        <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">创建时间</label>
            <input type="date" value={createdAtFrom} onChange={e => setCreatedAtFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <span className="text-gray-400 text-sm">至</span>
            <input type="date" value={createdAtTo} onChange={e => setCreatedAtTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">修改时间</label>
            <input type="date" value={updatedAtFrom} onChange={e => setUpdatedAtFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
            <span className="text-gray-400 text-sm">至</span>
            <input type="date" value={updatedAtTo} onChange={e => setUpdatedAtTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
          </div>
          <div className="flex items-center gap-2">
            <UserGroupIcon className="w-4 h-4 text-gray-400" />
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">业务员</label>
            <select value={salespersonFilter} onChange={e => setSalespersonFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white">
              <option value="">全部</option>
              {allSalespersons.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setCreatedAtFrom('');
              setCreatedAtTo('');
              setUpdatedAtFrom('');
              setUpdatedAtTo('');
              setSalespersonFilter('');
            }}
            className="ml-auto inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <XMarkIcon className="w-4 h-4" />
            重置
          </button>
        </div>

        <div
          ref={containerRef}
          className="bg-gradient-to-br from-white via-gray-50 to-gray-100/50 rounded-2xl shadow-2xl border border-gray-200/50 relative overflow-hidden"
          style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}
        >
          {/* 工具栏 */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-md p-2 border-b border-gray-200/60 shadow-sm flex-wrap">
            <button onClick={() => setTool('select')} className={`p-1.5 rounded-lg transition-all ${tool === 'select' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`} title="选择">🖱️</button>
            <button onClick={() => setTool('pen')} className={`p-1.5 rounded-lg transition-all ${tool === 'pen' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`} title="画笔">✏️</button>
            <button onClick={() => setTool('eraser')} className={`p-1.5 rounded-lg transition-all ${tool === 'eraser' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'hover:bg-gray-100'}`} title="橡皮擦">🧹</button>

            {tool === 'pen' && (
              <div className="flex items-center gap-1 ml-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color ? 'border-blue-500 scale-110 shadow-md' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            )}

            <button onClick={undo} className="p-1.5 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-30" title="撤销" disabled={history.length === 0}>↩️</button>
            <button onClick={clearAll} className="p-1.5 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-30" title="清空" disabled={history.length === 0}>🗑️</button>
            <button onClick={saveNow} className="p-1.5 rounded-lg hover:bg-gray-100 transition-all disabled:opacity-30" title="手动保存" disabled={isSaving}>
              {isSaving ? '⏳' : '💾'}
            </button>
            {saveStatus === 'saving' && <span className="text-xs text-blue-500 animate-pulse ml-1">保存中...</span>}
            {saveStatus === 'saved' && <span className="text-xs text-green-500 ml-1">✓ 已保存</span>}

            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button
              onClick={expandAll}
              disabled={isExpandingRef.current}
              className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${isExpandingRef.current ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              title="展开全部（递归加载直到完成）"
            >
              📂
              {loadProgress !== null && (
                <span className="ml-1 text-xs text-blue-500">
                  已加载 {loadProgress}
                </span>
              )}
            </button>
            <button onClick={toggleFullscreen} className="p-1.5 rounded-lg hover:bg-gray-100 transition-all" title="全屏">
              {isFullscreen ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
            </button>
          </div>

          <div className="pt-14 w-full h-full">
            {treeData ? (
              <Tree
                ref={treeRef}
                data={treeData}
                orientation="horizontal"
                translate={treeViewState.translate}
                zoom={treeViewState.scale}
                zoomable
                panable
                scaleExtent={{ min: 0.2, max: 5 }}
                separation={{ siblings: 1.8, nonSiblings: 2.2 }}
                nodeSize={{ x: 280, y: 70 }}
                pathFunc="diagonal"
                pathClass="tree-link"
                renderCustomNodeElement={renderCustomNode}
                onUpdate={handleTreeUpdate}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                {salespersonFilter ? `没有匹配“${salespersonFilter}”的客户` : '暂无数据'}
              </div>
            )}
          </div>

          <canvas
            ref={canvasRef}
            className="absolute left-0 top-14 w-full"
            style={{ pointerEvents: tool === 'select' ? 'none' : 'auto', height: 'calc(100% - 56px)' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* 业务员图例 */}
          {allSalespersons.length > 0 && (
            <div className="absolute left-3 top-[60px] z-20 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm p-2 max-h-[calc(100%-80px)] overflow-y-auto pointer-events-none">
              <div className="flex flex-col gap-1.5 pointer-events-auto">
                <span className="text-xs font-semibold text-gray-500">业务员</span>
                {allSalespersons.map((name) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: salespersonColorMap[name] || '#ccc' }}
                    ></span>
                    <span className="text-xs text-gray-700 truncate max-w-[80px]">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 加载进度指示器 */}
          {loadProgress !== null && (
            <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm p-2">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-blue-500 animate-spin" />
                <span className="text-xs text-gray-600">
                  加载中，已加载 {loadProgress} 个节点
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .tree-link {
          stroke: #94a3b8 !important;
          stroke-width: 2 !important;
          fill: none !important;
          opacity: 0.7;
        }
        .tree-link:hover {
          stroke: #475569 !important;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}