"use client";

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { LedgerTable } from '@/features/invoices/LedgerTable';
import { supabase } from '@/lib/supabase';
import { InvoiceRecord } from '@/types/invoice';
import { toast } from 'sonner';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`*, line_items:invoice_line_items(*)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Error fetching ledger');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (updatedInvoice: InvoiceRecord) => {
    try {
      const { line_items, ...invoiceData } = updatedInvoice;
      const { error } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', updatedInvoice.id);
        
      if (error) throw error;
      setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
      toast.success('Invoice updated successfully.');
    } catch (error: any) {
      console.error('Error updating invoice:', error);
      toast.error('Error updating invoice: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      toast.success('Invoice deleted from the ledger.');
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast.error('Error deleting invoice: ' + error.message);
    }
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500 w-full">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-primary">Invoices Ledger</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage all extracted documents.</p>
        </div>
        
        {isLoading ? (
          <div className="h-64 flex items-center justify-center backdrop-blur-sm bg-card/30 rounded-xl border border-border/50">
            <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              Reading the great ledger...
            </div>
          </div>
        ) : (
          <LedgerTable 
            invoices={invoices} 
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </PageContainer>
  );
}
