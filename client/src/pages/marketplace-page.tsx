import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Agent } from "@shared/schema";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import AgentSubscription from "@/components/marketplace/agent-subscription";
import { queryClient } from "@/lib/queryClient";
import { check_secrets } from "@/lib/check-secrets";

export default function MarketplacePage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["/api/agents"],
    select: (data) => data || []
  });
  
  const { data: userAgents = [], isLoading: isLoadingUserAgents } = useQuery({
    queryKey: ["/api/user/agents"],
    select: (data) => data || []
  });
  
  // Check if Stripe key is available
  const [stripeKeyChecked, setStripeKeyChecked] = useState(false);
  const [stripeKeyAvailable, setStripeKeyAvailable] = useState(false);
  
  useEffect(() => {
    const checkStripeKey = async () => {
      if (!stripeKeyChecked) {
        try {
          const keyAvailable = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
          setStripeKeyAvailable(!!keyAvailable);
        } catch (error) {
          setStripeKeyAvailable(false);
        }
        setStripeKeyChecked(true);
      }
    };
    
    checkStripeKey();
  }, [stripeKeyChecked]);
  
  const filteredAgents = searchQuery ? 
    agents.filter((agent: Agent) => 
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
      agent.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : agents;
  
  const isSubscribed = (agentId: number) => {
    return userAgents.some((agent: Agent) => agent.id === agentId);
  };
  
  // Safely create categories array
  const categoriesSet = new Set<string>();
  agents.forEach((agent: Agent) => {
    if (agent.category) {
      categoriesSet.add(agent.category);
    }
  });
  const categories = Array.from(categoriesSet);
  
  const handleSubscriptionComplete = () => {
    // Refresh user agents data
    queryClient.invalidateQueries({ queryKey: ["/api/user/agents"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user/subscriptions"] });
  };
  
  // Agent card component to avoid duplication
  const AgentCard = ({ agent }: { agent: Agent }) => {
    return (
      <Card key={agent.id} className="overflow-hidden">
        <div className={`h-3 bg-gradient-to-r ${agent.gradientClass}`}></div>
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center mb-3">
            <div className={`h-12 w-12 rounded-full ${agent.iconBgClass} flex items-center justify-center`}>
              <i className={`bx ${agent.iconClass} text-xl text-primary`}></i>
            </div>
            <div className="ml-3">
              <CardTitle>{agent.name}</CardTitle>
              <div className="flex items-center mt-1">
                {agent.isPopular && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Popular</Badge>
                )}
                {agent.isNew && (
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 ml-2">New</Badge>
                )}
                {agent.isEnterprise && (
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 ml-2">Enterprise</Badge>
                )}
              </div>
            </div>
          </div>
          <CardDescription>{agent.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-900">
              ${(agent.price / 100).toFixed(2)}/month
            </span>
            <Badge variant="outline">{agent.category}</Badge>
          </div>
          <div className="mt-2 mb-4">
            <h3 className="text-sm font-medium text-gray-900">Features:</h3>
            <p className="text-sm text-gray-600">{agent.features}</p>
          </div>
          
          {stripeKeyAvailable ? (
            <AgentSubscription
              agent={agent}
              isSubscribed={isSubscribed(agent.id)}
              onSubscriptionComplete={handleSubscriptionComplete}
            />
          ) : (
            <Button 
              className="w-full"
              disabled={true}
            >
              Stripe API Key Required
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">AI Agent Marketplace</h1>
            <p className="text-gray-600 mt-1">Discover and subscribe to AI agents for your automation needs.</p>
          </header>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search agents by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAgents && filteredAgents.length > 0 ? (
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAgents.map((agent: Agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                  ))}
                </div>
              </TabsContent>
              
              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents
                      .filter((agent: Agent) => agent.category === category)
                      .map((agent: Agent) => (
                        <AgentCard key={agent.id} agent={agent} />
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Card className="mt-6">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="bx bx-search text-blue-600 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Agents Found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? 
                    `We couldn't find any agents matching "${searchQuery}"` : 
                    "There are no agents available at the moment."}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
