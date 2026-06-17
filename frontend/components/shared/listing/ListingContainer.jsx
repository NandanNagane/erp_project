"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, LayoutList, LayoutGrid, ChevronDown } from "lucide-react";

export function ListingContainer({
  title = "Listing",
  data = [],
  tableView,
  listView,
  gridView,

  showSync = true,
}) {
  const [viewMode, setViewMode] = useState("table"); // 'table', 'list', 'grid'

  const renderView = () => {
    switch (viewMode) {
      case "grid":
        return gridView;
      case "list":
        return listView;
      case "table":
      default:
        return tableView;
    }
  };

  return (
    <div className="w-full flex flex-col mt-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-md shadow-sm">
        <div className="text-sm font-medium text-slate-800 ml-2">{title}</div>
        <div className="flex items-center gap-2">
          {showSync && (
            <Button
              onClick={() => console.log("syncing")}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium"
            >
              Sync Elastic Data
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 border-slate-200"
              >
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 font-medium">
              <DropdownMenuItem
                className="flex items-center justify-between text-blue-600 cursor-pointer"
                onClick={() => setViewMode("table")}
              >
                Table View
                <Menu className="size-4" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center justify-between text-slate-600 cursor-pointer"
                onClick={() => setViewMode("list")}
              >
                List View
                <LayoutList className="size-4" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center justify-between text-blue-600 cursor-pointer"
                onClick={() => setViewMode("grid")}
              >
                Grid View
                <LayoutGrid className="size-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Render Selected View */}
      {renderView()}

      {/* Basic Pagination Footer */}
      <div className="flex justify-between items-center p-3 mt-4 text-sm text-slate-600 bg-white border border-slate-200 rounded-md shadow-sm">
        <div>
          View{" "}
          <span className="font-medium text-black">
            1 - {Math.min(10, data.length)}
          </span>{" "}
          of <span className="font-medium text-black">{data.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-slate-400"
            disabled
          >
            &lt;
          </Button>
          <Button
            variant="default"
            className="h-8 w-8 bg-blue-600 text-white px-0 hover:bg-blue-700"
          >
            1
          </Button>
          <span className="px-2 text-slate-400">...</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-slate-400"
          >
            &gt;
          </Button>
          <div className="flex items-center ml-2 cursor-pointer border px-2 py-1 rounded">
            <span className="mr-2">10</span>
            <ChevronDown className="size-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
