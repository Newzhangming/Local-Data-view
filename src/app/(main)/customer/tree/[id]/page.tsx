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
  1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  2: 'bg-blue-100 text-blue-800 border-blue-300',
  3: 'bg-green-100 text-green-800 border-green-300',
  4: 'bg-purple-100 text-purple-800 border-purple-300',
  5: 'bg-pink-100 text-pink-800 border-pink-300',
};

function cloneTree(node: TreeNode): TreeNode {
  return {
    ...node,
    children: node.children?.map(cloneTree),
  };
}

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

  useEffect(() => {
    if (!id) return;
    const fetchRoot = async () => {
      try {
        const res = await customerService.queryCustomer({ id });
        if (res.msg === 'success' && res.data) {
          const rootNode: TreeNode = {
            ...res.data,
            expanded: true,
            loading: false,
            children: undefined,
          };
          await loadChildren(rootNode);
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
  }, [id, router]);

  const loadChildren = useCallback(async (node: TreeNode) => {
    if (node.children !== undefined || node.loading) return;
    node.loading = true;
    setRoot((prev) => (prev ? cloneTree(prev) : prev));

    try {
      const res = await customerService.queryCustomers({ parentId: node.id, pageSize: 100 });
      if (res.msg === 'success') {
        const children = res.data.map((c) => ({
          ...c,
          children: undefined,
          expanded: false,
          loading: false,
        }));
        node.children = children;
      } else {
        // 失败保持 undefined
      }
    } catch (error) {
      console.error(error);
    } finally {
      node.loading = false;
      setRoot((prev) => (prev ? cloneTree(prev) : prev));
    }
  }, []);

  const toggleNode = useCallback(async (targetNode: TreeNode) => {
    if (!root) return;
    const newRoot = cloneTree(root);
    let found = false;

    const traverse = (node: TreeNode): boolean => {
      if (node.id === targetNode.id) {
        found = true;
        if (node.loading) return true;
        if (node.children !== undefined) {
          node.expanded = !node.expanded;
          return true;
        } else {
          node.expanded = true;
          (async () => {
            await loadChildren(node);
            setRoot((prev) => (prev ? cloneTree(prev) : prev));
          })();
          return true;
        }
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
  }, [root, loadChildren]);

  const expandAll = useCallback(() => {
    if (!root) return;
    const newRoot = cloneTree(root);
    const traverse = (node: TreeNode) => {
      node.expanded = true;
      if (node.children) node.children.forEach(traverse);
    };
    traverse(newRoot);
    setRoot(newRoot);
  }, [root]);

  const collapseAll = useCallback(() => {
    if (!root) return;
    const newRoot = cloneTree(root);
    const traverse = (node: TreeNode) => {
      if (node.children) node.children.forEach(traverse);
      if (node.id !== newRoot.id) node.expanded = false;
    };
    traverse(newRoot);
    setRoot(newRoot);
  }, [root]);

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

  const renderCustomNode = ({ nodeDatum }: any) => {
    const raw = nodeDatum.attributes.raw as TreeNode;
    const hasChildren = raw.children && raw.children.length > 0;
    const isExpanded = raw.expanded;

    return (
      <foreignObject width={260} height={50} x={-130} y={-25} style={{ overflow: 'visible' }}>
        <div
          className={`flex items-center gap-2 py-1.5 px-3 rounded-lg shadow-sm border transition-all hover:shadow-md cursor-pointer ${raw.loading ? 'opacity-50' : ''} bg-white border-gray-200 text-sm`}
          style={{ minWidth: '120px', whiteSpace: 'nowrap' }}
          onClick={(e) => { e.stopPropagation(); toggleNode(raw); }}
        >
          <span className="w-5 h-5 flex items-center justify-center text-gray-400 flex-shrink-0">
            {raw.loading ? (
              <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : hasChildren ? (
              isExpanded ? <ChevronRightIcon className="w-4 h-4 transform rotate-90" /> : <ChevronRightIcon className="w-4 h-4" />
            ) : (
              <BuildingOfficeIcon className="w-4 h-4 text-gray-300" />
            )}
          </span>
          <span className="text-blue-600 hover:underline font-medium" onClick={(e) => { e.stopPropagation(); router.push(`/customer/view/${raw.id}`); }}>
            {raw.name}
          </span>
          {raw.contact_person && <span className="text-xs text-gray-500 flex items-center gap-1"><UserIcon className="w-3 h-3" /> {raw.contact_person}</span>}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${tierColorMap[raw.tier] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>T{raw.tier}</span>
          {raw.phone && <span className="text-xs text-gray-400 hidden sm:inline">📞 {raw.phone}</span>}
        </div>
      </foreignObject>
    );
  };

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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      document.body.classList.add('fullscreen-mode');
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      document.body.classList.remove('fullscreen-mode');
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400 animate-pulse">加载中...</div></div>;
  }

  if (!root) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-400">客户不存在</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-4 flex-wrap">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 transition">← 返回</button>
          <h1 className="text-2xl font-bold text-gray-800">客户关系思维导图</h1>
          <span className="text-sm text-gray-400 ml-auto">点击节点展开/折叠</span>

          <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <button onClick={() => treeRef.current?.zoomIn?.()} className="p-1.5 hover:bg-gray-100 rounded-md" title="放大">＋</button>
            <button onClick={() => treeRef.current?.zoomOut?.()} className="p-1.5 hover:bg-gray-100 rounded-md" title="缩小">－</button>
            <button onClick={() => treeRef.current?.resetZoom?.()} className="p-1.5 hover:bg-gray-100 rounded-md" title="重置视图">⟲</button>
            <button onClick={expandAll} className="p-1.5 hover:bg-gray-100 rounded-md" title="展开全部">📂</button>
            <button onClick={collapseAll} className="p-1.5 hover:bg-gray-100 rounded-md" title="收起全部">📁</button>
            <button onClick={toggleFullscreen} className="p-1.5 hover:bg-gray-100 rounded-md" title="全屏">
              {isFullscreen ? <ArrowsPointingInIcon className="w-4 h-4" /> : <ArrowsPointingOutIcon className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索客户..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>

        <div ref={containerRef} className="bg-white rounded-xl shadow-sm border border-gray-100 p-2" style={{ height: 'calc(100vh - 180px)', minHeight: '500px', position: 'relative' }}>
          {treeData ? (
            <Tree
              ref={treeRef}
              data={treeData}
              orientation="horizontal"
              translate={{ x: 150, y: 200 }}
              zoomable
              panable
              scaleExtent={{ min: 0.1, max: 3 }}
              separation={{ siblings: 1.5, nonSiblings: 2 }}
              nodeSize={{ x: 280, y: 80 }}
              pathFunc="step"
              renderCustomNodeElement={renderCustomNode}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">暂无数据</div>
          )}
        </div>
      </div>
    </div>
  );
}