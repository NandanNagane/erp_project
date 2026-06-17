import Header from "@/components/header";
import { serverFetch } from "@/lib/api/server-fetch";
import { UserProvider } from "@/lib/providers";

export default async function ERPLayout({ children, breadcrumb }) {
  const userPromise = serverFetch("/user/profile");

  return (
    <>
      <UserProvider userPromise={userPromise}>
        <Header />
        <div className="main-wrapper min-h-full bg-slate-50 flex flex-col p-6">
          <nav>{breadcrumb}</nav>
          <main className="flex-1">{children}</main>
        </div>
      </UserProvider>
    </>
  );
}
