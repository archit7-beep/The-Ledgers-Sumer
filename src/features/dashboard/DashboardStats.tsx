import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InvoiceRecord } from '@/types/invoice';
import { FileText, IndianRupee, Users } from 'lucide-react';

interface DashboardStatsProps {
  invoices: InvoiceRecord[];
}

export function DashboardStats({ invoices }: DashboardStatsProps) {
  // 1. Total Expenditures
  const totalExpenditures = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  
  // 2. Total Line Items Processed
  const totalLineItems = invoices.reduce((sum, inv) => sum + (inv.line_items?.length || 0), 0);

  // 3. Active Vendors
  const activeVendors = new Set(invoices.map(inv => inv.vendor_name).filter(Boolean)).size;
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="backdrop-blur-md bg-card/40 border border-border/50 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenditures</CardTitle>
          <IndianRupee className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">₹{totalExpenditures.toFixed(2)}</div>
        </CardContent>
      </Card>
      
      <Card className="backdrop-blur-md bg-card/40 border border-border/50 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Line Items Processed</CardTitle>
          <FileText className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalLineItems}</div>
        </CardContent>
      </Card>
      
      <Card className="backdrop-blur-md bg-card/40 border border-border/50 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeVendors}</div>
        </CardContent>
      </Card>
    </div>
  );
}
