import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import MobileMenu from "@/components/layout/mobile-menu";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Agent } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function MarketplacePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: agents, isLoading } = useQuery({
    queryKey: ["/api/agents"],
  });
  
  const { data: userAgents } = useQuery({
    queryKey: ["/api/user/agents"],
  });
  
  const subscribeMutation = useMutation({
    mutationFn: async (agentId: number) => {
      const res = await apiRequest("POST", `/api/agents/${agentId}/subscribe`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/agents"] });
      toast({
        title: "Subscription successful",
        description: "You have successfully subscribed to this agent.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const filteredAgents = searchQuery && agents 
    ? agents.filter((agent: Agent) => 
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        agent.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
        agent.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : agents;
  
  const isSubscribed = (agentId: number) => {
    return userAgents?.some((agent: Agent) => agent.id === agentId);
  };
  
  const categories = agents 
    ? [...new Set(agents.map((agent: Agent) => agent.category))]
    : [];
  
  const handleSubscribe = (agentId: number) => {
    subscribeMutation.mutate(agentId);
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
                        <Button 
                          className="w-full"
                          onClick={() => handleSubscribe(agent.id)}
                          disabled={isSubscribed(agent.id) || subscribeMutation.isPending}
                        >
                          {subscribeMutation.isPending && subscribeMutation.variables === agent.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {isSubscribed(agent.id) ? 'Already Subscribed' : 'Subscribe'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAgents
                      .filter((agent: Agent) => agent.category === category)
                      .map((agent: Agent) => (
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
                            </div>
                            <div className="mt-2 mb-4">
                              <h3 className="text-sm font-medium text-gray-900">Features:</h3>
                              <p className="text-sm text-gray-600">{agent.features}</p>
                            </div>
                            <Button 
                              className="w-full"
                              onClick={() => handleSubscribe(agent.id)}
                              disabled={isSubscribed(agent.id) || subscribeMutation.isPending}
                            >
                              {subscribeMutation.isPending && subscribeMutation.variables === agent.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              {isSubscribed(agent.id) ? 'Already Subscribed' : 'Subscribe'}
                            </Button>
                          </CardContent>
                        </Card>
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
