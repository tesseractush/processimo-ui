import { useState } from "react";
import LoginForm from "./login-form";
import SignupForm from "./signup-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthTabs() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Logo Header */}
      <div className="text-center p-6 bg-gradient-to-r from-blue-600 to-violet-500">
        <h1 className="text-3xl font-bold text-white">Processimo</h1>
        <p className="text-blue-100 mt-1">AI Automation Platform</p>
      </div>

      <Tabs defaultValue="login">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="login">Log In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <div className="p-6">
            <LoginForm />
          </div>
        </TabsContent>
        
        <TabsContent value="signup">
          <div className="p-6">
            <SignupForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
