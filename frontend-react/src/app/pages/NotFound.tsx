import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">找不到此頁面</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>返回首頁</span>
        </Link>
      </div>
    </div>
  );
}
