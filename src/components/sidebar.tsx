import { ReconciliationOutlined } from "@ant-design/icons";
import Link from "next/link";
import React from "react";

export default function Sidebar() {
  return (
    <div className={"flex flex-col h-full bg-secondary rounded-none gap-3 p-5"}>
      <div className={"flex flex-row gap-2"}>
        <ReconciliationOutlined />
        <Link href={"/messages"} className={"text-xl"}>
          微信消息
        </Link>
      </div>
    </div>
  );
}
