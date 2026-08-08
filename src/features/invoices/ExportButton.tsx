import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { InvoiceRecord } from '@/types/invoice';
import Papa from 'papaparse';

interface ExportButtonProps {
  invoices: InvoiceRecord[];
}

export function ExportButton({ invoices }: ExportButtonProps) {
  const handleExport = () => {
    const dataToExport = invoices.map(inv => ({
      'Invoice Number': inv.invoice_number,
      'Invoice Date': inv.invoice_date,
      'Vendor': inv.vendor_name,
      'Currency': inv.currency,
      'Subtotal': inv.subtotal,
      'Tax': inv.tax,
      'Total': inv.total_amount,
      'Payment Status': inv.payment_status,
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" onClick={handleExport} className="gap-2 border-white/10 dark:border-white/20 bg-background/10 backdrop-blur-md hover:bg-background/30 hover:border-amber-500/40 transition-all duration-200">
      <div className="flex items-center justify-center bg-foreground/10 rounded-full p-1">
        <Download className="h-3.5 w-3.5" />
      </div>
      Export CSV
    </Button>
  );
}
