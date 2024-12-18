import { LucideIcon, Newspaper } from "lucide-react";
import React, { ReactElement } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  count: number | undefined;
  icon: ReactElement<LucideIcon>;
  className?: string;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  count,
  icon,
  className,
  onClick,
}: DashboardCardProps) {
  return (
    <Card
      className={cn("bg-slate-100 dark:bg-slate-800 p-4 pb-0", className)}
      onClick={onClick}
    >
      <CardContent>
        <h3
          className={
            "text-3xl text-center mb-4 font-bold text-slate-500 dark:text-slate-200"
          }
        >
          {title || "Posts"}
        </h3>
        <div className={"flex gap-5 justify-center items-center"}>
          {icon || <Newspaper className={"text-slate-500"} size={72} />}
          <div className="h3 text-5xl font-semibold text-slate-500 dark:text-slate-200">
            {count === undefined ? (
              <Spinner size={"small"} className={"text-slate-500"} />
            ) : (
              count
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
