import Link from "next/link";
import { ChevronDownIcon, DotIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dashboardModules from "@/components/shared/dashboard-modules";
import { Fragment } from "react";

async function BreadcrumbSlot({ params }) {
  const { catchAll } = await params;

  const breadcrumbItems = [];
  let breadcrumbPage = <></>;
  for (let i = 0; i < catchAll.length; i++) {
    const route = catchAll[i];
    const href = `/${catchAll.at(0)}/${route}`;
    if (i === catchAll.length - 1) {
      breadcrumbPage = (
        <BreadcrumbItem>
          <BreadcrumbPage className="capitalize">{route}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    } else {
      breadcrumbItems.push(
        <Fragment key={href}>
          <BreadcrumbSeparator>
            <DotIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={href} className="capitalize">
              {route}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Fragment>,
      );
    }
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <DotIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 outline-none">
                  Modules
                  <ChevronDownIcon className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  {dashboardModules.map((module) => (
                    <DropdownMenuItem key={module.name}>
                      <Link href={module.url}>{module.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          {breadcrumbItems}
          <BreadcrumbSeparator>
            <DotIcon />
          </BreadcrumbSeparator>
          {breadcrumbPage}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}

export default BreadcrumbSlot;
