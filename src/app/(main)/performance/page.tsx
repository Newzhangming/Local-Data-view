'use client';

import { Tabs } from 'antd';
import React, { useCallback, useState } from 'react';

import Page1 from './page1';
import Page2 from './page2';
import Page3 from './page3';

// 项目业绩页面
export default function Page() {
  const [tabs] = useState<{ key: string; label: string }[]>([
    { key: 'single_condition', label: '房建单条判定条件' },
    { key: 'double_condition', label: '房建双条判定条件' },
    { key: 'page3', label: '市政条件' },
  ]);

  const [tabId, setTabId] = useState<string>();
  const handleTabChange = useCallback((activeKey: string) => setTabId(activeKey), []);

  return (
    <>
      <Tabs defaultActiveKey="single_condition" type="card" size={'large'} style={{ marginBottom: 32 }} items={tabs} onChange={handleTabChange} />
      {tabId === 'single_condition' && <Page1 />}
      {tabId === 'double_condition' && <Page2 />}
      {tabId === 'page3' && <Page3 />}
    </>
  );
}
