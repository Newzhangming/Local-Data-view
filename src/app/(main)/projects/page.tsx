"use client";

import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { App } from "antd";
import dayjs from "dayjs";
import React, { useCallback, useRef, useState } from "react";

import Ellipsis from "@/components/ellipsis";
import { ProjectDto, ProjectReq } from "@/constants/dto";
import { getProjects } from "@/services/project";
import { getStorage, setStorage } from "@/utils/storage";

export default function Page() {
  const columns: ProColumns<ProjectDto>[] = [
    {
      hideInSearch: true,
      title: "序号",
      render: (text, record, index) => `${index + 1}`,
    },
    {
      title: "项目编号",
      dataIndex: "proj_no",
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: "项目名称",
      dataIndex: "proj_name",
      hideInSearch: true,
      copyable: false,
      renderText: (text: string) => <Ellipsis text={text}/>,
      align: "left",
    },
    {
      title: "项目分类",
      dataIndex: "proj_type",
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: "总面积",
      dataIndex: "total_area",
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    }, {
      title: "数据等级",
      dataIndex: "data_level",
      hideInSearch: false,
      copyable: true,
      ellipsis: false,
    },
    {
      title: "日期",
      dataIndex: "createdAt",
      tooltip: "创建时间",
      hideInSearch: true,
      renderText: (value) => dayjs(value).format("MM-DD HH:mm:ss"),
      align: "center",
    }
  ];

  const [pageInfo, setPageInfo] = useState({
    current: 1,
    pageSize: Number(getStorage("listPageSize")) || 10,
  });
  const actionRef = useRef<ActionType>(null);
  const { message } = App.useApp();

  const getRequestData = useCallback(async (params: ProjectReq) => {
    const input = { ...params, from: "list" };
    return getProjects(input).then((res) => {
      if (res.msg !== "success") {
        message.error(res.msg);
        return { data: [], success: false, total: 0 };
      }
      return { data: res.data, success: true, total: res.total };
    });
  }, []);

  return (
    <ProTable<ProjectDto>
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
          setStorage("listPageSize", pageSize);
        },
      }}
      dateFormatter="string"
      onReset={() => {
        actionRef.current?.reload();
      }}
      tooltip={undefined}
    />
  );
}
