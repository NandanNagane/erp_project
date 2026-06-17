import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { RotateCw, LogIn, ChevronDown, MoreVertical } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { ListingContainer } from "@/components/shared/listing/ListingContainer";
import { DataTable } from "@/components/shared/listing/DataTable";
import { DataList } from "@/components/shared/listing/DataList";
import { DataGrid } from "@/components/shared/listing/DataGrid";

export default function UserListing({ users }) {
  // --- Table Configuration ---
  const userColumns = [
    {
      header: "Name",
      accessorKey: "name",
      className: "text-primary font-medium",
      cellClassName: "font-medium text-primary",
    },
    { header: "Email", accessorKey: "email" },
    {
      header: "Phone Number",
      accessorKey: "phone",
      render: (row) => row.phone || "-",
    },
    { header: "User Name", accessorKey: "username" },
    {
      header: "Group Name",
      accessorKey: "group",
      render: (row) => row.userGroups?.[0]?.group?.name || "-",
    },
    {
      header: "Company Name",
      accessorKey: "company",
      cellClassName: "text-primary",
      render: (row) => row.company?.name || "-",
    },
    {
      header: "Status",
      accessorKey: "status",
      render: (row) =>
        row.status === 1 ? (
          <span className="text-green-600 font-medium text-md">Active</span>
        ) : (
          <span className="text-red-600 font-medium text-md">Inactive</span>
        ),
    },
    {
      header: "Login As",
      accessorKey: "loginAs",
      render: () => (
        <div className="flex items-center gap-2 text-slate-400">
          <LogIn className="size-4 cursor-pointer hover:text-primary transition-colors" />
          <RotateCw className="size-4 cursor-pointer hover:text-primary transition-colors" />
        </div>
      ),
    },
    {
      header: "Pin Access",
      accessorKey: "pinAccess",
      render: (row) =>
        row.isSuperAdmin === 1 ? (
          <span className="text-slate-400">-</span>
        ) : (
          <Switch checked={false} />
        ),
    },
  ];

  // --- List Item Renderer ---
  const renderListRow = (user) => (
    <div
      key={user.id}
      className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-md shadow-sm hover:border-blue-200 transition-colors"
    >
      <div className="flex flex-col w-1/4">
        <span className="text-md text-slate-500 mb-1">User</span>
        <div className="flex items-center gap-2">
          <span className="text-md font-medium text-primary">{user.name}</span>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-md text-primary">{user.email}</span>
        </div>
      </div>
      <div className="flex flex-col w-1/4">
        <span className="text-md text-slate-500 mb-1">Group Role</span>
        <span className="text-md font-medium text-primary">
          {user.userGroups?.[0]?.group?.name || "No Group"}
        </span>
      </div>
      <div className="flex flex-col w-1/6">
        <span className="text-md text-slate-500 mb-1">Status</span>
        <div>
          {user.status === 1 ? (
            <Badge className="bg-green-500 hover:bg-green-600 border-transparent text-white rounded-md px-3 font-normal">
              Active
            </Badge>
          ) : (
            <Badge className="bg-red-500 hover:bg-red-600 border-transparent text-white rounded-md px-3 font-normal">
              Inactive
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between w-1/4">
        <div className="flex flex-col">
          <span className="text-md text-slate-500 mb-1">Company Name</span>
          <span className="text-md font-medium text-primary">
            {user.company?.name || "No Company"}
          </span>
        </div>
        <ChevronDown className="size-5 text-primary cursor-pointer" />
      </div>
    </div>
  );

  // --- Grid Card Renderer ---
  const renderGridCard = (user) => {
    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "U";

    return (
      <Card
        key={user.id}
        className="p-5 flex flex-col gap-4 bg-white border-slate-200"
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <div className="relative">
              <Avatar className="size-12 rounded-full border border-slate-100">
                <AvatarImage src={user.profImg} />
                <AvatarFallback className="bg-primary text-white font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className={`absolute bottom-0 right-0 size-3.5 border-2 border-white rounded-full ${
                  user.status === 1 ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-md font-medium text-primary">
                {user.name}
              </span>
              <span className="text-xs text-slate-500 max-w-[150px] truncate">
                {user.email}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400"
          >
            <MoreVertical className="size-4" />
          </Button>
        </div>
        <div className="flex items-end justify-between border-b border-slate-100 pb-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 mb-1">Group Name</span>
            <span className="text-md font-medium text-slate-800">
              {user.userGroups?.[0]?.group?.name || "-"}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium text-primary border-primary hover:bg-primary/5"
          >
            Login As
            <ChevronDown className="ml-1 size-3" />
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-md">
            <span className="text-slate-500 text-xs w-1/3">User Name</span>
            <span className="font-medium text-slate-800 w-2/3">
              {user.username}
            </span>
          </div>
          <div className="flex justify-between items-center text-md">
            <span className="text-slate-500 text-xs w-1/3">Company Name</span>
            <span className="font-medium text-primary w-2/3">
              {user.company?.name || "-"}
            </span>
          </div>
          <div className="flex justify-between items-center text-md">
            <span className="text-slate-500 text-xs w-1/3">Phone Number</span>
            <span className="font-medium text-slate-800 w-2/3">
              {user.phone || "-"}
            </span>
          </div>
          <div className="flex justify-between items-center text-md">
            <span className="text-slate-500 text-xs w-1/3">Date Of Birth</span>
            <span className="font-medium text-slate-800 w-2/3">
              {user.dob ? format(new Date(user.dob), "dd/MM/yyyy") : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center text-md">
            <span className="text-slate-500 text-xs w-1/3">Last Access</span>
            <span className="font-medium text-slate-800 w-2/3">
              {user.lastAccessAt
                ? format(new Date(user.lastAccessAt), "dd/MM/yyyy hh:mm a")
                : "-"}
            </span>
          </div>
          <div className="flex justify-between items-center text-md mt-1">
            <span className="text-slate-500 text-xs w-1/3">Pin Access</span>
            <div className="w-2/3">
              {user.isSuperAdmin === 1 ? (
                <span className="text-slate-400">-</span>
              ) : (
                <Switch
                  checked={false}
                  className="data-[state=checked]:bg-primary"
                />
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <ListingContainer
        title="Listing"
        data={users}
        tableView={<DataTable data={users} columns={userColumns} />}
        listView={<DataList data={users} renderItem={renderListRow} />}
        gridView={<DataGrid data={users} renderCard={renderGridCard} />}
      />
    </>
  );
}
