import { Outlet, Link, useLocation } from "react-router";
import { Search, LineChart, Briefcase, FileText, User, Settings, Bell } from "lucide-react";

const navItems = [
  { path: "/", label: "個股分析", icon: Search },
  { path: "/portfolio", label: "持股管理", icon: Briefcase },
  { path: "/reports", label: "策略報告", icon: FileText },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100">
      {/* Top Navigation */}
      <header className="bg-[#13161f] border-b border-gray-800 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <LineChart className="w-5 h-5" />
              </div>
              <span className="text-xl font-semibold">台股智能分析系統</span>
            </div>
            
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <User className="w-5 h-5" />
              <span>帳戶設定</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}