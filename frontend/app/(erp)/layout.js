import Header from "@/components/header";
import { NavBreadcrumb } from "@/components/NavBreadcrumb";
import { serverFetch } from "@/lib/api/server-fetch";
import UserProvider from "@/lib/providers";

export default async function ERPLayout({ children }) {
  const userPromise = serverFetch("/user/profile");

  return (
    <>
      <UserProvider userPromise={userPromise}>
        <Header />
        <nav>
          <NavBreadcrumb />
        </nav>
        <main className="flex-1">{children}</main>
      </UserProvider>
    </>
  );
}
