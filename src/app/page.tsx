import React from 'react';

import NavBar from '@/components/nav-bar';
import Sidebar from '@/components/sidebar';

export default function MainLayout() {
  return (
    <>
      <NavBar />
      <div className={'flex'}>
        <div className={'h-[100vh] w-[180px] hidden md:block'}>
          <Sidebar />
        </div>
        <div className={'p-5 w-full'}>标旗建筑人才AI分析统计管理系统</div>
      </div>
    </>
  );
}
