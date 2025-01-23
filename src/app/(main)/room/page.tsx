'use client';

import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { App } from 'antd';
import React, { useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { RoomBaseDto, RoomsReq } from '@/constants/dto';
import { getRooms } from '@/services/room';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const columns: ProColumns<RoomBaseDto>[] = [
    {
      hideInSearch: true,
      title: '序号',
      render: (text, record, index) => `${index + 1}`,
    },
    {
      title: '群ID',
      dataIndex: 'id',
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: '群名称',
      dataIndex: 'room_name',
      hideInSearch: true,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
    },
    {
      title: '日期',
      dataIndex: 'createdAt',
      tooltip: '创建时间',
      hideInSearch: true,
      valueType: 'dateTime',
      align: 'center',
    },
  ];

  const [pageInfo, setPageInfo] = useState({
    current: 1,
    pageSize: Number(getStorage('listPageSize')) || 10,
  });
  const actionRef = useRef<ActionType>(null);
  const { message } = App.useApp();

  const getRequestData = useCallback(async (params: RoomsReq) => {
    const input = { ...params, from: 'list' };
    return getRooms(input).then((res) => {
      if (res.msg !== 'success') {
        message.error(res.msg);
        return { data: [], success: false, total: 0 };
      }
      return { data: res.data, success: true, total: res.total };
    });
  }, []);

  return (
    <ProTable<RoomBaseDto>
      columns={columns}
      actionRef={actionRef}
      request={getRequestData}
      rowKey="id"
      search={false}
      toolBarRender={undefined}
      options={false}
      pagination={{
        pageSizeOptions: [10, 15, 20, 25, 30],
        showQuickJumper: true,
        pageSize: pageInfo.pageSize,
        onShowSizeChange: (_, pageSize) => {
          setPageInfo({ pageSize, current: 1 });
          setStorage('listPageSize', pageSize);
        },
      }}
      dateFormatter="string"
      onReset={actionRef.current?.reload}
      tooltip={undefined}
    />
  );
}
