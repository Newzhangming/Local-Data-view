import type { BaseQueryFilterProps } from '@ant-design/pro-components';
import { ReactNode } from 'react';

export const locale = { emptyText: '暂无数据' };

const searchOptionRender = (searchConfig: Omit<BaseQueryFilterProps, 'submitter' | 'isForm'>, props: Omit<BaseQueryFilterProps, 'searchConfig'>, dom: ReactNode[]) => {
  const [reset, query] = dom;
  return [query, reset];
};

export const search: BaseQueryFilterProps = { labelWidth: 'auto', span: 3, optionRender: searchOptionRender };

export const pagination = { pageSizeOptions: [10, 15, 20, 25, 30], showQuickJumper: true };
