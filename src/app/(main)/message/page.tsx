'use client';

import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { message } from 'antd';
import React, { useCallback, useRef, useState } from 'react';

import Ellipsis from '@/components/ellipsis';
import { locale, pagination, search } from '@/components/table-props';
import { MessageBaseDto, MessagesReq, RoomBaseDto } from '@/constants/dto';
import { getMessages } from '@/services/message';
import { getRoomIdNames } from '@/services/room';
import { getStorage, setStorage } from '@/utils/storage';

export default function Page() {
  const [messageApi, contextHolder] = message.useMessage();
  const columns: ProColumns<MessageBaseDto>[] = [
    {
      hideInSearch: true,
      title: '序号',
      render: (text, record, index) => `${index + 1}`,
      width: '4%',
    },
    {
      title: '搜索群',
      dataIndex: 'room_id',
      hideInSearch: false,
      hidden: true,
      request: async () => {
        const { data } = await getRoomIdNames();
        return data.map((item: RoomBaseDto) => ({ label: item.room_name, value: item.id }));
      },
      align: 'left',
    },
    {
      title: '微信群',
      dataIndex: 'room_name',
      hideInSearch: true,
      copyable: true,
      ellipsis: false,
      width: '13%',
    },
    {
      title: '微信昵称',
      dataIndex: 'nickname',
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
      width: '10%',
    },
    {
      title: '对谁',
      dataIndex: 'to',
      hideInSearch: true,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text} />,
      align: 'left',
      width: '10%',
    },
    {
      title: '说了什么',
      dataIndex: 'content',
      hideInSearch: true,
      copyable: false,
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

  const getRequestData = useCallback(async (params: MessagesReq) => {
    const input: MessagesReq = { ...params, room_id: params.room_id ?? '', nickname: params.nickname ?? '' };
    return getMessages(input).then((res) => {
      if (res.msg !== 'success') {
        messageApi.error(res.msg);
        return { data: [], success: false, total: 0 };
      }
      return { data: res.data, success: true, total: res.total };
    });
  }, []);

  return (
    <>
      {contextHolder}
      <ProTable<MessageBaseDto>
        columns={columns}
        actionRef={actionRef}
        request={getRequestData}
        rowKey="id"
        locale={locale}
        search={search}
        toolBarRender={undefined}
        options={false}
        pagination={{
          ...pagination,
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
    </>
  );
}
