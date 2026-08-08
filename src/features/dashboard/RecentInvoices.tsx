import { InvoiceRecord } from "@/types/invoice";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface RecentInvoicesProps {
  invoices: InvoiceRecord[];
}

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  // Get top 5 recent
  const recent = invoices.slice(0, 5);
  
  if (recent.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No recent invoices.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {recent.map((invoice) => {
        const vendorName = invoice.vendor_name || 'Unknown Vendor';
        const initials = vendorName.substring(0, 2).toUpperCase();
        const date = invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'Unknown Date';
        
        return (
          <div key={invoice.id} className="flex items-center">
            <Avatar className="h-9 w-9 border border-border/50">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{vendorName}</p>
              <p className="text-sm text-muted-foreground">
                {date} • {invoice.invoice_number || 'No ID'}
              </p>
            </div>
            <div className="ml-auto font-medium text-primary">
              +₹{invoice.total_amount?.toFixed(2) || '0.00'}
            </div>
          </div>
        );
      })}
    </div>
  );
}
