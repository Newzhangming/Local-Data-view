import { ReactNode } from 'react';

export default function StatCard({
  icon,
  title,
  value,
  change,
}: {
  icon: ReactNode;
  title: string;
  value: number;
  change?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-full">{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {change && <p className="text-xs text-gray-400 mt-1">{change}</p>}
        </div>
      </div>
    </div>
  );
}