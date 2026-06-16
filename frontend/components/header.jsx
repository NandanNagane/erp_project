import {
  BookmarkIcon,
  ChevronDownIcon,
  LanguagesIcon,
  MenuIcon,
  MegaphoneIcon,
  SearchIcon,
  UserIcon,
} from "lucide-react";

import logoImg from "@/assets/logo.png";

import Image from "next/image";
import ProfileMenu from "./ProfileMenu";
import { Suspense } from "react";
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 min-w-0 items-center justify-between gap-3 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Image
            src={logoImg}
            alt="Production Planning Logo"
            width={152}
            height={152}
            className="object-contain"
            priority
          />

          <span
            className="hidden h-8 w-px shrink-0 bg-border md:inline-flex"
            aria-hidden="true"
          />

          <div className=" flex items-center justify-center gap-3 h-11 w-full border border-border bg-muted/70 px-3 py-2 pl-2 text-sm text-foreground">
            <span className="sr-only">Search</span>
            <SearchIcon
              className="ml-1 size-6 shrink-0 text-foreground"
              aria-hidden="true"
            />
            <input
              className="h-11 w-full  bg-muted/70  py-2  text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
              type="search"
              placeholder="Search"
            />
            <div className="flex h-full shrink-0 items-stretch border-l border-border/90">
              <select
                className="h-full border-0 bg-muted/70 px-3 pr-8  text-muted-foreground outline-none focus:bg-background focus:text-foreground"
                aria-label="Search scope"
                defaultValue="All"
              >
                <option>All</option>
                <option>Products</option>
                <option>Companies</option>
                <option>Users</option>
              </select>
              <ChevronDownIcon
                className="pointer-events-none absolute right-8 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        <nav className="flex min-w-0 items-center gap-1" aria-label="Primary">
          <IconButton label="Saved">
            <BookmarkIcon className="size-5" />
          </IconButton>
          <IconButton label="Announcements">
            <MegaphoneIcon className="size-5" />
          </IconButton>

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-muted/70 px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            aria-label="Choose language"
          >
            <LanguagesIcon className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">English</span>
            <ChevronDownIcon className="size-4" aria-hidden="true" />
          </button>

          <div
            className="mx-1 hidden h-8 w-px shrink-0 bg-border sm:inline-flex"
            aria-hidden="true"
          />

          <Suspense fallback={<div>Loading profile...</div>}>
            <ProfileMenu />
          </Suspense>

          <div
            className="mx-1 hidden h-8 w-px shrink-0 bg-border md:inline-flex"
            aria-hidden="true"
          />

          <button
            type="button"
            className="inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/20"
            aria-label="Open menu"
          >
            <MenuIcon className="size-5" aria-hidden="true" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

function IconButton({ label, children }) {
  return (
    <button
      type="button"
      className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/20"
      aria-label={label}
    >
      {children}
    </button>
  );
}
