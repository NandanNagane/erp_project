"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ModuleCard({ title, items }) {
  const router = useRouter();

  return (
    <Card className="w-full border shadow-sm rounded-xl overflow-hidden bg-white">
      <CardHeader className="border-b px-6 py-4 bg-white">
        <CardTitle className="text-base font-normal text-slate-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 bg-white">
        <ul className="py-4 px-6 space-y-4">
          {items && items.map((item, index) => (
            <li 
              key={index}
              onClick={() => router.push(item.url || "#")}
              className="flex items-center text-[15px] text-slate-500 hover:text-slate-800 cursor-pointer transition-colors group"
            >
              <span className="h-[5px] w-[5px] rounded-full bg-slate-400 mr-3 flex-shrink-0 group-hover:bg-slate-600 transition-colors"></span>
              {item.name}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
