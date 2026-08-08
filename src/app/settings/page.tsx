"use client";

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Save, Building, Key, Bell } from 'lucide-react';

export default function SettingsPage() {
  const handleSave = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 w-full">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Settings</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your application preferences and integrations.</p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card/40 backdrop-blur-sm border border-border/50">
            <TabsTrigger value="general" className="gap-2"><Building className="h-4 w-4"/> General</TabsTrigger>
            <TabsTrigger value="api" className="gap-2"><Key className="h-4 w-4"/> API Keys</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4"/> Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 animate-in fade-in duration-500">
            <Card className="backdrop-blur-md bg-card/40 border border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>Update your company details and default currency.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input id="companyName" defaultValue="Royal Scribes" className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select defaultValue="INR">
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="AUD">AUD (A$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
                <Button onClick={handleSave} className="gap-2 ml-auto"><Save className="h-4 w-4"/> Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4 animate-in fade-in duration-500">
            <Card className="backdrop-blur-md bg-card/40 border border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>API Integrations</CardTitle>
                <CardDescription>Manage your Groq AI and Supabase connection keys.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="api">Groq API Key</Label>
                  <Input id="api" type="password" placeholder="gsk_..." className="bg-background/50 font-mono" />
                  <p className="text-xs text-muted-foreground">Used for the ultra-fast Llama-3 extraction engine.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/50 bg-muted/20 px-6 py-4">
                <Button onClick={handleSave} className="gap-2 ml-auto"><Save className="h-4 w-4"/> Save Keys</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 animate-in fade-in duration-500">
            <Card className="backdrop-blur-md bg-card/40 border border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive alerts for new invoices.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/30">
                  <div className="space-y-0.5">
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive an email when a new invoice is uploaded.</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
