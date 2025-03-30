import { Agent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface RecentAgentsProps {
  agents: Agent[];
}

export default function RecentAgents({ agents }: RecentAgentsProps) {
  const recentAgents = agents.slice(0, 3); // Show only the first 3 agents
  
  // A helper function to format "last used" text
  const getLastUsedText = (index: number) => {
    const times = ["2 hours ago", "yesterday", "3 days ago"];
    return times[index % times.length];
  };
  
  return (
    <div className="lg:col-span-2 bg-white rounded-lg shadow">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900">Recently Used Agents</h2>
      </div>
      <div className="p-6">
        {recentAgents.length > 0 ? (
          <div className="space-y-4">
            {recentAgents.map((agent, index) => (
              <div key={agent.id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition">
                <div className={`flex-shrink-0 h-12 w-12 rounded-full ${agent.iconBgClass} flex items-center justify-center`}>
                  <i className={`bx ${agent.iconClass} text-xl text-primary`}></i>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-sm font-medium text-gray-900">{agent.name}</h3>
                  <p className="text-xs text-gray-500">Last used {getLastUsedText(index)}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <i className="bx bx-play-circle text-xl"></i>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">You haven't used any agents yet.</p>
            <Button variant="outline" asChild>
              <Link href="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        )}
        
        <div className="mt-4 text-center">
          <Link href="/agents">
            <a className="text-sm font-medium text-blue-600 hover:text-blue-500">
              View all agents →
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
