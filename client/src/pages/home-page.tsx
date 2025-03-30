import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import StatsGrid from "@/components/dashboard/stats-grid";
import RecentAgents from "@/components/dashboard/recent-agents";
import QuickActions from "@/components/dashboard/quick-actions";
import MarketplacePreview from "@/components/dashboard/marketplace-preview";
import CustomRequestModal from "@/components/dashboard/custom-request-modal";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  const { data: featuredAgents, isLoading: isLoadingAgents } = useQuery({
    queryKey: ["/api/agents/featured"],
  });
  
  const { data: userAgents, isLoading: isLoadingUserAgents } = useQuery({
    queryKey: ["/api/user/agents"],
  });
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || user?.username || "User"}!
            </h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your AI agents.</p>
          </header>

          <StatsGrid />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {isLoadingUserAgents ? (
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <RecentAgents agents={userAgents || []} />
            )}
            
            <QuickActions onRequestCustom={() => setIsRequestModalOpen(true)} />
          </div>

          {isLoadingAgents ? (
            <div className="mt-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <MarketplacePreview agents={featuredAgents || []} />
          )}
        </div>
      </main>
      
      <CustomRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)} 
      />
    </div>
  );
}
