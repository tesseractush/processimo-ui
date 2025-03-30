import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function MobileMenu() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/agents", label: "My AI Agents" },
    { path: "/marketplace", label: "Marketplace" },
    { path: "/workflows", label: "Workflows" },
    { path: "/teams", label: "Agent Teams" },
    { path: "/profile", label: "Profile" },
    { path: "/billing", label: "Billing" },
    { path: "/settings", label: "Settings" },
  ];
  
  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMenuOpen(false);
  };
  
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "U";
  };
  
  return (
    <>
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-gray-900 text-white border-b border-gray-700">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button onClick={toggleMenu} className="mr-2" aria-label="Toggle menu">
              <i className="bx bx-menu text-2xl"></i>
            </button>
            <h1 className="text-xl font-bold">Processimo</h1>
          </div>
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Mobile menu */}
        <div className={cn("bg-gray-800", isMenuOpen ? "block" : "hidden")}>
          <nav className="px-2 pt-2 pb-4">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a 
                  className={cn(
                    "block px-3 py-2 rounded hover:bg-gray-700",
                    location === item.path ? "text-white font-medium" : "text-gray-300"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              </Link>
            ))}
            <button 
              className="block w-full text-left px-3 py-2 mt-4 rounded text-gray-300 hover:bg-gray-700"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </button>
          </nav>
        </div>
      </div>
      
      {/* Empty space to push content down on mobile */}
      <div className="h-16 md:hidden"></div>
    </>
  );
}
