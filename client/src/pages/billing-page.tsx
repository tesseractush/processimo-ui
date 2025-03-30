import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Agent } from "@shared/schema";

export default function BillingPage() {
  const { user } = useAuth();
  
  const { data: userAgents, isLoading } = useQuery({
    queryKey: ["/api/user/agents"],
  });
  
  // Calculate total monthly cost
  const totalMonthlyCost = userAgents
    ? userAgents.reduce((total: number, agent: Agent) => total + (agent.price || 0), 0) / 100
    : 0;
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
            <p className="text-gray-600 mt-1">Manage your subscriptions and payment methods.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Current Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">Pay As You Go</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-6">
                  You're currently paying only for the agents you subscribe to.
                </p>
                <Button variant="outline" className="w-full">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Monthly Cost</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-900 mb-4">
                      ${totalMonthlyCost.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on {userAgents?.length || 0} active agent{userAgents?.length !== 1 ? 's' : ''}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  No payment method on file.
                </p>
                <Button className="w-full">
                  <i className="bx bx-credit-card mr-2"></i>
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Subscription History</CardTitle>
              <CardDescription>Your active and past subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : userAgents && userAgents.length > 0 ? (
                <div className="space-y-4">
                  {userAgents.map((agent: Agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full ${agent.iconBgClass} flex items-center justify-center`}>
                          <i className={`bx ${agent.iconClass} text-primary`}></i>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">{agent.name}</h3>
                          <p className="text-xs text-gray-500">Active subscription</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${(agent.price / 100).toFixed(2)}/month
                        </p>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-1">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">You don't have any active subscriptions.</p>
                  <Button onClick={() => window.location.href = '/marketplace'}>
                    Browse Marketplace
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
