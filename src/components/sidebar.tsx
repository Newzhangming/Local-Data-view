import { MessageOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import Link from "next/link";
import React from "react";

export default function Sidebar() {
  return (
    <div className={"flex flex-col h-full bg-secondary rounded-none gap-3 p-5"}>
      <div className={"flex flex-row gap-2"}>
        <MessageOutlined />
        <Link href={"/messages"} className={"text-xl"}>
          微信消息
        </Link>
      </div>
      <div className={"flex flex-row gap-2"}>
        <UsergroupAddOutlined/>
        <Link href={"/rooms"} className={"text-xl"}>
          微信群
        </Link>
      </div>
    </div>
  );
}
