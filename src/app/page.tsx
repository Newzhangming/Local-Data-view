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
        <div className={'p-5 w-full'}>{process.env.NEXT_PUBLIC_APP_NAME}</div>
      </div>
    </>
  );
}
