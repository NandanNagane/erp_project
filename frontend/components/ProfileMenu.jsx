"use client";
import { UserContext, useUser } from "@/lib/providers";
import { ChevronDownIcon } from "lucide-react";
import { UserIcon } from "lucide-react";
export default function ProfileMenu() {
  const user = useUser();

  console.log(user);

  return (
    <button
      type="button"
      className="hidden min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/20 md:inline-flex"
      aria-label="Open account menu"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <UserIcon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block max-w-36 truncate text-sm font-medium text-foreground">
          {user?.username}
        </span>
        <span className="block max-w-36 truncate text-xs text-muted-foreground">
          {user?.role}
        </span>
      </span>
      <ChevronDownIcon
        className="size-4 text-muted-foreground"
        aria-hidden="true"
      />
    </button>
  );
}
