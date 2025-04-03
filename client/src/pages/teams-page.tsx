import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { AgentTeam } from "@shared/schema";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { ArrowRight, UserPlus } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function TeamsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch agent teams
  const { data: agentTeams = [] } = useQuery<AgentTeam[]>({
    queryKey: ["/api/agent-teams"],
    enabled: !!user,
  });

  return (
    <div className="container py-10">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">AI Agent Teams</h1>
        <p className="text-xl text-muted-foreground">
          Specialized teams of AI agents working together to solve complex problems
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentTeams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>

      {agentTeams.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-2xl font-medium mb-2">No teams available yet</h3>
          <p className="text-muted-foreground mb-6">
            Check back soon for specialized agent teams
          </p>
        </div>
      )}
    </div>
  );
}

function TeamCard({ team }: { team: AgentTeam }) {
  const { toast } = useToast();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const posX = e.clientX - rect.left;
    const posY = e.clientY - rect.top;
    const relativeX = posX / rect.width;
    const relativeY = posY / rect.height;
    
    mouseX.set(relativeX);
    mouseY.set(relativeY);
    
    x.set((relativeX - 0.5) * 10);
    y.set((relativeY - 0.5) * 10);
  };

  const rotateX = useTransform(y, [-10, 10], [5, -5]);
  const rotateY = useTransform(x, [-10, 10], [-5, 5]);
  
  const background = useMotionTemplate`radial-gradient(
    circle at ${mouseX.get() * 100}% ${mouseY.get() * 100}%,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 50%
  )`;

  return (
    <motion.div
      className="relative h-[400px] rounded-xl overflow-hidden bg-gradient-to-br border shadow-lg group"
      style={{
        background: `linear-gradient(to bottom right, ${team.gradientClass})`,
        rotateX,
        rotateY,
        perspective: "1000px"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        animate(x, 0);
        animate(y, 0);
      }}
    >
      <motion.div
        className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background }}
      />

      <div className="h-full p-6 flex flex-col text-white">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
            <i className={`bx ${team.iconClass} text-2xl`}></i>
          </div>
          <div className="ml-3">
            <h3 className="text-2xl font-bold">{team.name}</h3>
            <p className="text-sm opacity-90">AI Agent Team</p>
          </div>
        </div>

        <p className="text-md opacity-90 mb-4">{team.description}</p>
        
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Target:</p>
          <p className="text-sm opacity-90">{team.target}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium mb-1">Impact:</p>
          <p className="text-sm opacity-90">{team.impact}</p>
        </div>
        
        <div className="mt-auto">
          <p className="text-2xl font-bold mb-2">${(team.price / 100).toFixed(2)}<span className="text-sm font-normal opacity-90">/month</span></p>
          
          <div className="flex space-x-2">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={() => {
                toast({
                  title: "Coming soon!",
                  description: "Team subscriptions will be available soon.",
                });
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Subscribe
            </Button>
            
            <Button variant="outline" className="bg-white bg-opacity-10">
              <Link to={`/teams/${team.id}`}>
                <span className="flex items-center">
                  Details
                  <ArrowRight className="h-4 w-4 ml-2" />
                </span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}