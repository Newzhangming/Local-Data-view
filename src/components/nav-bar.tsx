// 输入 rfc，回车

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import logo from "../img/logo.png";

import ThemeToggler from "@/components/theme-toggler";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { removeStorage } from "@/utils/storage";

export default function NavBar() {
  const onLogout = () => {
    removeStorage("token");
  };

  return (
    <div
      className={
        "bg-primary dark:bg-slate-700 py-2 px-5 text-white flex justify-between items-center"
      }
    >
      <Link href={"/"}>
        <Image src={logo} alt={"武汉鱼在水出版社"} width={40} />
      </Link>
      <div className={"text-3xl"}>标旗建筑人才AI分析统计管理系统</div>
      <div className={"flex items-center"}>
        <ThemeToggler />
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback className="text-black">BT</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel
              className={"text-slate-500 dark:text-slate-300"}
            />
            <DropdownMenuItem>
              <Link
                onClick={onLogout}
                href="/auth"
                className={"text-slate-500 dark:text-slate-300"}
              >
                退出登录
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
