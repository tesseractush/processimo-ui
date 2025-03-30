import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Agent, WorkflowRequest } from "@shared/schema";

export default function AdminDashboard() {
  const { data: agents, isLoading: isLoadingAgents } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });
  
  const { data: workflowRequests, isLoading: isLoadingRequests } = useQuery<WorkflowRequest[]>({
    queryKey: ["/api/admin/workflow-requests"],
  });
  
  return (
    <AdminLayout 
      title="Admin Dashboard" 
      subtitle="Overview of your platform statistics"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAgents ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <div className="text-3xl font-bold">{agents?.length || 0}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRequests ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <div className="text-3xl font-bold">
                {workflowRequests?.filter((req: WorkflowRequest) => req.status === 'pending').length || 0}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$2,450</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Workflow Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingRequests ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : workflowRequests && workflowRequests.length > 0 ? (
              <div className="space-y-4">
                {workflowRequests.slice(0, 5).map((request: WorkflowRequest) => (
                  <div key={request.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-medium">{request.name}</h3>
                      <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {request.description}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        request.status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : request.status === 'approved' 
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No workflow requests yet.
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Popular Agents</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAgents ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : agents && agents.length > 0 ? (
              <div className="space-y-4">
                {agents
                  .sort((a: Agent, b: Agent) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))
                  .slice(0, 5)
                  .map((agent: Agent) => (
                    <div key={agent.id} className="flex items-center border-b pb-4">
                      <div className={`h-10 w-10 rounded-full ${agent.iconBgClass} flex items-center justify-center mr-4`}>
                        <i className={`bx ${agent.iconClass} text-primary`}></i>
                      </div>
                      <div>
                        <h3 className="font-medium">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${(agent.price / 100).toFixed(2)}/month
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No agents available yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}