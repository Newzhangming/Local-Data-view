'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import { CustomerService } from '@/services/customer';
import { CustomerDto } from '@/constants/customer';
import {
  ChevronRightIcon,
  BuildingOfficeIcon,
  UserIcon,
  MagnifyingGlassIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import Tree from 'react-d3-tree';
import type { TreeNodeDatum } from 'react-d3-tree';

const customerService = new CustomerService();

interface TreeNode extends CustomerDto {
  children?: TreeNode[];
  loading?: boolean;
  expanded?: boolean;
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

// 预设颜色（现代化配色）
const PRESET_COLORS = [
  '#ef4444', // 红
  '#f97316', // 橙
  '#eab308', // 黄
  '#22c55e', // 绿
  '#3b82f6', // 蓝
  '#8b5cf6', // 紫
  '#ec4899', // 粉
  '#1e293b', // 深灰
  '#64748b', // 灰
  '#000000', // 黑
];

export default function CustomerTreePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<'select' | 'pen' | 'eraser'>('select');
  const [history, setHistory] = useState<DrawAction[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  // 颜色状态
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const isSavingRef = useRef(false);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [treeViewState, setTreeViewState] = useState({
    translate: { x: 200, y: 250 },
    scale: 1,
  });

  const treeViewStateRef = useRef(treeViewState);
  const prevViewStateRef = useRef(treeViewState);
  const onUpdateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const pendingViewStateRef = useRef<{ translate: { x: number; y: number }; scale: number } | null>(null);

  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    treeViewStateRef.current = treeViewState;
    prevViewStateRef.current = treeViewState;
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

  // ---------- 绘图核心（支持真正的橡皮擦） ----------
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
        // 橡皮擦：使用 destination-out 实现透明擦除
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

    // 绘制当前正在画的笔触
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

  // ---------- 持久化加载与保存 ----------
  useEffect(() => {
    const loadState = async () => {
      try {
        const res = await customerService.getTreeState(id);
        if (res.msg === 'success' && res.data) {
          setExpandedIds(new Set(res.data.expandedNodeIds || []));
          setHistory(res.data.drawingHistory || []);
          if (res.data.viewState) {
            setTreeViewState(res.data.viewState);
          }
        }
      } catch (e) {
        console.error('Failed to load tree state', e);
      }
    };
    if (id) loadState();
  }, [id]);

  const saveStateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 收集所有展开节点
  const collectExpandedIds = useCallback((node: TreeNode): string[] => {
    let ids: string[] = [];
    if (node.expanded) ids.push(node.id);
    if (node.children) {
      for (const child of node.children) {
        ids = ids.concat(collectExpandedIds(child));
      }
    }
    return ids;
  }, []);

  // 自动保存（防抖）+ 防并发 + 状态反馈
  const saveState = useCallback(async () => {
    if (!id) return;
    if (isSavingRef.current) return; // 防止并发

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const expandedNodeIds = root ? collectExpandedIds(root) : [];
      await customerService.saveTreeState({
        rootId: id,
        expandedNodeIds,
        drawingHistory: history,
        viewState: treeViewState,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      console.error('Failed to save tree state', e);
      setSaveStatus('idle');
    } finally {
      isSavingRef.current = false;
    }
  }, [id, root, history, treeViewState, collectExpandedIds]);

  // 手动保存（直接调用 saveState）
  const saveNow = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveState();
    } catch (e) {
      console.error('Manual save failed', e);
    } finally {
      setIsSaving(false);
    }
  }, [saveState]);

  // 防抖触发（时间调整为 800ms）
  useEffect(() => {
    if (saveStateTimerRef.current) clearTimeout(saveStateTimerRef.current);
    saveStateTimerRef.current = setTimeout(saveState, 800);
    return () => {
      if (saveStateTimerRef.current) clearTimeout(saveStateTimerRef.current);
    };
  }, [saveState]);

  // ---------- 全屏监听 ----------
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => resizeCanvas(), 50);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // ---------- 加载根节点并恢复展开 ----------
  const fetchChildrenData = useCallback(async (parentId: string): Promise<TreeNode[]> => {
    try {
      const res = await customerService.queryCustomers({ parentId, pageSize: 100 });
      if (res.msg === 'success') {
        return res.data.map((c) => ({
          ...c,
          children: undefined,
          expanded: false,
          loading: false,
        }));
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  const restoreExpanded = useCallback(async (node: TreeNode, ids: Set<string>) => {
    if (ids.has(node.id)) {
      node.expanded = true;
      if (!node.children && !node.loading) {
        node.loading = true;
        try {
          const children = await fetchChildrenData(node.id);
          node.children = children;
        } catch (e) {
          console.error(e);
        } finally {
          node.loading = false;
        }
      }
      if (node.children) {
        for (const child of node.children) {
          await restoreExpanded(child, ids);
        }
      }
    }
  }, [fetchChildrenData]);

  useEffect(() => {
    if (!id) return;
    const fetchRoot = async () => {
      try {
        const res = await customerService.queryCustomer({ id });
        if (res.msg === 'success' && res.data) {
          const rootNode: TreeNode = {
            ...res.data,
            expanded: false,
            loading: false,
            children: undefined,
          };
          await restoreExpanded(rootNode, expandedIds);
          setRoot(rootNode);
        } else {
          alert('未找到该客户');
          router.back();
        }
      } catch (error) {
        console.error(error);
        alert('加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchRoot();
  }, [id, router, restoreExpanded, expandedIds]);

  const loadChildren = useCallback(async (node: TreeNode) => {
    if (node.children !== undefined || node.loading) return;
    node.loading = true;
    setRoot((prev) => (prev ? cloneTree(prev) : prev));
    try {
      const children = await fetchChildrenData(node.id);
      node.children = children;
    } catch (error) {
      console.error(error);
    } finally {
      node.loading = false;
      setRoot((prev) => (prev ? cloneTree(prev) : prev));
    }
  }, [fetchChildrenData]);

  const toggleNode = useCallback(async (targetNode: TreeNode) => {
    if (tool !== 'select') return;
    if (!root) return;
    const newRoot = cloneTree(root);
    let found = false;

    const traverse = (node: TreeNode): boolean => {
      if (node.id === targetNode.id) {
        found = true;
        if (node.loading) return true;
        const newExpanded = new Set(expandedIds);
        if (node.children !== undefined) {
          node.expanded = !node.expanded;
        } else {
          node.expanded = true;
          (async () => {
            await loadChildren(node);
            setRoot((prev) => (prev ? cloneTree(prev) : prev));
          })();
        }
        if (node.expanded) {
          newExpanded.add(node.id);
        } else {
          newExpanded.delete(node.id);
        }
        setExpandedIds(newExpanded);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          if (traverse(child)) return true;
        }
      }
      return false;
    };

    traverse(newRoot);
    if (found) setRoot(newRoot);
  }, [root, loadChildren, tool, expandedIds]);

  const expandAll = useCallback(async () => {
    if (!root) return;
    const newRoot = cloneTree(root);
    const allIds = new Set<string>();

    const traverse = async (node: TreeNode) => {
      node.expanded = true;
      allIds.add(node.id);
      if (node.children === undefined && !node.loading) {
        const children = await fetchChildrenData(node.id);
        node.children = children;
      }
      if (node.children) {
        for (const child of node.children) {
          await traverse(child);
        }
      }
    };

    await traverse(newRoot);
    setRoot(newRoot);
    setExpandedIds(allIds);
  }, [root, fetchChildrenData]);

  // ---------- Tree 数据转换 ----------
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

  // ===================== 修改的 renderCustomNode（加入截断） =====================
  const renderCustomNode = ({ nodeDatum }: any) => {
    const raw = nodeDatum.attributes.raw as TreeNode;
    const hasChildren = raw.children && raw.children.length > 0;
    const isExpanded = raw.expanded;

    return (
      <foreignObject width={280} height={60} x={-140} y={-30} style={{ overflow: 'visible' }}>
        <div
          className={`flex items-center gap-2 py-2 px-4 rounded-2xl shadow-lg border transition-all duration-200 hover:shadow-xl hover:scale-105 ${
            raw.loading ? 'opacity-60' : ''
          } bg-gradient-to-br from-white to-gray-50 border-gray-200/80 text-sm cursor-pointer overflow-hidden`}
          style={{ minWidth: '140px', whiteSpace: 'nowrap' }}
          onClick={(e) => { e.stopPropagation(); toggleNode(raw); }}
        >
          <span className="w-5 h-5 flex items-center justify-center text-gray-400 flex-shrink-0">
            {raw.loading ? (
              <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : hasChildren ? (
              <ChevronRightIcon className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
            ) : (
              <BuildingOfficeIcon className="w-4 h-4 text-gray-300" />
            )}
          </span>
          <span
            className="text-blue-700 hover:text-blue-900 font-semibold truncate max-w-[100px] flex-shrink-0"
            onClick={(e) => { e.stopPropagation(); if (tool === 'select') router.push(`/customer/view/${raw.id}`); }}
          >
            {raw.name}
          </span>
          {raw.contact_person && (
            <span className="text-xs text-gray-500 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[60px] flex-shrink-0">
              <UserIcon className="w-3 h-3 flex-shrink-0" /> {raw.contact_person}
            </span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${tierColorMap[raw.tier] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            T{raw.tier}
          </span>
          {raw.phone && (
            <span className="text-xs text-gray-400 hidden sm:inline bg-gray-100 px-2 py-0.5 rounded-full truncate max-w-[80px] flex-shrink-0">
              📞 {raw.phone}
            </span>
          )}
        </div>
      </foreignObject>
    );
  };
  // ======================================================================

  const filteredRoot = useCallback(() => {
    if (!root || !searchKeyword.trim()) return root;
    const keyword = searchKeyword.trim().toLowerCase();
    const filterNode = (node: TreeNode): TreeNode | null => {
      const match = node.name.toLowerCase().includes(keyword);
      let filteredChildren: TreeNode[] = [];
      if (node.children) {
        filteredChildren = node.children.map((child) => filterNode(child)).filter((child): child is TreeNode => child !== null);
      }
      if (match || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children };
      }
      return null;
    };
    const filtered = filterNode(root);
    return filtered || root;
  }, [root, searchKeyword]);

  const treeData = filteredRoot() ? convertToTreeDatum(filteredRoot()!) : null;

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

  // ---------- Canvas 事件 ----------
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
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
        <div className="text-gray-400">客户不存在</div>
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
          <h1 className="text-2xl font-bold text-gray-800">客户关系思维导图</h1>
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

            {/* 固定颜色选择器（仅在画笔工具时显示） */}
            {tool === 'pen' && (
              <div className="flex items-center gap-1 ml-1">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      selectedColor === color
                        ? 'border-blue-500 scale-110 shadow-md'
                        : 'border-transparent hover:scale-110'
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
            {/* 保存状态提示 */}
            {saveStatus === 'saving' && <span className="text-xs text-blue-500 animate-pulse ml-1">保存中...</span>}
            {saveStatus === 'saved' && <span className="text-xs text-green-500 ml-1">✓ 已保存</span>}

            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button onClick={expandAll} className="p-1.5 rounded-lg hover:bg-gray-100 transition-all" title="展开全部">📂</button>
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
                nodeSize={{ x: 300, y: 100 }}
                pathFunc="diagonal"
                pathClass="tree-link"
                renderCustomNodeElement={renderCustomNode}
                onUpdate={handleTreeUpdate}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">暂无数据</div>
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