import { BuildOutlined, HomeOutlined } from '@ant-design/icons';

import Copyable from '@/components/copyable';

export const breadcrumbItems = (content: string | undefined) => [
  {
    href: '/',
    title: (
      <>
        <HomeOutlined />
        <span>首页</span>
      </>
    ),
  },
  {
    href: '/project',
    title: (
      <>
        <BuildOutlined />
        <span>工程项目</span>
      </>
    ),
  },
  { title: <Copyable content={content} /> },
];
