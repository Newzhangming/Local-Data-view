"use client";

import { ProLayout } from "@ant-design/pro-components";
import React from "react";

export default function Page() {
  return (
    <ProLayout title={"标旗供需AI分析统计系统"}>
      标旗供需AI分析统计管理系统, 点击进入<a href={'/messages'} className={"text-blue-600"}>列表信息</a>
    </ProLayout>
  );
}
