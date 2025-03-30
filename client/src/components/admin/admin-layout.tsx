import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "bxs-dashboard" },
    { path: "/admin/agents", label: "Manage Agents", icon: "bx-bot" },
    { path: "/admin/workflow-requests", label: "Workflow Requests", icon: "bx-flow" },
    { path: "/admin/users", label: "Manage Users", icon: "bx-user" },
  ];
  
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username?.[0]?.toUpperCase() || "A";
  };
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col w-64 bg-gray-900 text-white">
        <div className="px-4 py-6 border-b border-gray-800 flex items-center">
          <span className="flex items-center justify-center w-10 h-10 rounded-md bg-blue-600 mr-3">
            <i className="bx bx-shield text-xl"></i>
          </span>
          <div>
            <h1 className="text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-gray-400">Processimo</p>
          </div>
        </div>
        
        <nav className="mt-8 flex-1 overflow-y-auto">
          <div className="px-4 mb-2 text-xs uppercase text-gray-400 font-semibold">Management</div>
          
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={cn(
                "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded mx-2 mb-1",
                location === item.path && "bg-blue-800 text-white"
              )}>
                <i className={`bx ${item.icon} mr-3`}></i>
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
          
          <div className="border-t border-gray-800 mt-6 pt-4 px-4">
            <Link href="/">
              <a className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 rounded mb-1">
                <i className="bx bx-arrow-back mr-3"></i>
                <span>Back to App</span>
              </a>
            </Link>
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center">
            <Avatar>
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">
                {user?.firstName || ""} {user?.lastName || user?.username || ""}
              </p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <i className="bx bx-loader-alt bx-spin mr-2"></i>
            ) : (
              <i className="bx bx-log-out mr-2"></i>
            )}
            Logout
          </Button>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50 bg-gray-900 text-white border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <span className="flex items-center justify-center w-8 h-8 rounded-md bg-blue-600 mr-2">
              <i className="bx bx-shield text-sm"></i>
            </span>
            <h1 className="text-lg font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/">
              <a className="p-2 rounded hover:bg-gray-800">
                <i className="bx bx-arrow-back"></i>
              </a>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              className="p-2 text-white"
              onClick={handleLogout}
            >
              <i className="bx bx-log-out"></i>
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="flex overflow-x-auto scrollbar-hide px-2 py-2 bg-gray-800">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a className={cn(
                "whitespace-nowrap px-4 py-2 mr-2 rounded-full text-sm font-medium",
                location === item.path 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-700"
              )}>
                <i className={`bx ${item.icon} mr-1`}></i>
                {item.label}
              </a>
            </Link>
          ))}
        </nav>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 pt-16 md:pt-0">
        <div className="p-6 lg:px-8">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
          </header>
          
          {children}
        </div>
      </main>
    </div>
  );
}