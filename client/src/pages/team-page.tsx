import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { AgentTeam, Agent } from "@shared/schema";
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { 
  ArrowLeft, 
  Users, 
  Building, 
  ListChecks, 
  ArrowUpRight, 
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WorkflowStep = {
  step: number;
  description: string;
  agent: string;
};

export default function TeamPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location] = useLocation();
  const [teamId, setTeamId] = useState<number | null>(null);
  
  // Extract team ID from URL
  useEffect(() => {
    const match = location.match(/\/teams\/(\d+)/);
    if (match && match[1]) {
      setTeamId(parseInt(match[1]));
    }
  }, [location]);
  
  // Fetch team data
  const { data: teamData, isLoading, error } = useQuery<{ team: AgentTeam, agents: Agent[] }>({
    queryKey: [`/api/agent-teams/${teamId}`],
    enabled: !!teamId && !!user,
  });
  
  const team = teamData?.team;
  const agents = teamData?.agents || [];
  
  if (isLoading) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (error || !team) {
    return (
      <div className="container py-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Team not found</h2>
          <p className="text-muted-foreground mb-6">The team you're looking for might have been removed or doesn't exist.</p>
          <Button asChild>
            <Link to="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const workflowSteps: WorkflowStep[] = team.workflow ? (team.workflow as any).steps || [] : [];
  
  return (
    <div className="container py-10">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link to="/teams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Link>
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{team.name}</h1>
            <p className="text-xl text-muted-foreground">{team.description}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              className="shadow-lg"
              onClick={() => {
                toast({
                  title: "Coming soon!",
                  description: "Team subscriptions will be available soon.",
                });
              }}
            >
              Subscribe to Team
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <Building className="mr-2 h-5 w-5 text-primary" />
                <p>{team.target}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <ListChecks className="mr-2 h-5 w-5 text-primary" />
                <p>{team.impact}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <p className="text-2xl font-bold">${(team.price / 100).toFixed(2)}</p>
                <p className="text-muted-foreground ml-2">/month</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Includes all team agents
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">How {team.name} Works</h2>
        <div className="space-y-8 relative">
          <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-muted z-0"></div>
          
          {workflowSteps.map((step, index) => (
            <div key={index} className="flex items-start relative z-10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground shrink-0 mr-4">
                {step.step}
              </div>
              <div className="bg-card border rounded-lg p-4 shadow-sm flex-1">
                <p className="mb-2">{step.description}</p>
                <Badge variant="secondary">
                  {step.agent}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-6">Team Agents</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <motion.div
              key={agent.id}
              whileHover={{ scale: 1.02 }}
              className="bg-card border rounded-lg overflow-hidden shadow-sm"
            >
              <div 
                className={`h-2 w-full bg-gradient-to-r ${agent.gradientClass || 'from-primary to-primary-foreground'}`}
              ></div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 rounded-full ${agent.iconBgClass} flex items-center justify-center`}>
                    <i className={`bx ${agent.iconClass} text-xl`}></i>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.teamRole}</p>
                  </div>
                </div>
                
                <p className="text-sm mb-4">{agent.description}</p>
                
                <div className="text-sm text-muted-foreground">
                  <strong>Features:</strong> {agent.features}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}