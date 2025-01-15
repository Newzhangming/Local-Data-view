import { BuildOutlined, CommentOutlined, HomeOutlined, MessageOutlined, SyncOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import Link from 'next/link';
import React from 'react';

// 阿里 icons
// https://ant.design/components/icon

export default function Sidebar() {
  return (
    <div className={'flex flex-col h-full bg-secondary rounded-none gap-3 p-5'}>
      <div className={'flex flex-row gap-2'}>
        <MessageOutlined />
        <Link href={'/message'} className={'text-xl'}>
          微信消息
        </Link>
      </div>
      <div className={'flex flex-row gap-2'}>
        <CommentOutlined />
        <Link href={'/room'} className={'text-xl'}>
          微信群
        </Link>
      </div>
      <div className={'flex flex-row gap-2'}>
        <SyncOutlined />
        <Link href={'/task'} className={'text-xl'}>
          采集任务
        </Link>
      </div>
      <div className={'flex flex-row gap-2'}>
        <UsergroupAddOutlined />
        <Link href={'/manager'} className={'text-xl'}>
          项目经理
        </Link>
      </div>
      <div className={'flex flex-row gap-2'}>
        <HomeOutlined />
        <Link href={'/company'} className={'text-xl'}>
          施工单位
        </Link>
      </div>
      <div className={'flex flex-row gap-2'}>
        <BuildOutlined />
        <Link href={'/projects'} className={'text-xl'}>
          工程项目
        </Link>
      </div>
    </div>
  );
}
