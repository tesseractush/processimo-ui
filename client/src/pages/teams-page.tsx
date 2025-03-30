import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TeamsPage() {
  const { user } = useAuth();
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Agent Teams</h1>
            <p className="text-gray-600 mt-1">Collaborate with your team on AI agents and workflows.</p>
          </header>

          <Card className="mt-6">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="bx bx-group text-blue-600 text-3xl"></i>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Team Collaboration Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                Share and manage AI agents with your team. This feature is currently in development.
              </p>
              <Button variant="outline">
                Get Notified When Available
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
