import { ModuleCard } from "@/components/ModuleCard";

export default function DashboardPage() {
  const dashboardModules = [
    { name: "users", url: "/users" },
    { name: "role", url: "/role" },
    { name: "permission", url: "/permission" },
    { name: "company", url: "/company" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="sticky top-16 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-8 py-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome To Production Planning
        </h1>
      </div>

      <div className="p-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ModuleCard title="Dashboards" items={dashboardModules} />
        </div>
      </div>
    </div>
  );
}

