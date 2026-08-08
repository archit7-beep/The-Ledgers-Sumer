"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { DashboardStats } from '@/features/dashboard/DashboardStats';
import { LedgerTable } from '@/features/invoices/LedgerTable';
import { UploadModal } from '@/features/invoices/UploadModal';
import { ExtractionReview } from '@/features/invoices/ExtractionReview';
import { ExportButton } from '@/features/invoices/ExportButton';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { InvoiceRecord } from '@/types/invoice';
import { toast } from 'sonner';
import PageContainer from '@/components/layout/page-container';
import { Overview } from '@/features/dashboard/Overview';
import { RecentInvoices } from '@/features/dashboard/RecentInvoices';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LedgerDashboard() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [reviewInvoice, setReviewInvoice] = useState<InvoiceRecord | null>(null);
  const [reviewFile, setReviewFile] = useState<File | null>(null);
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

  const handleExtractionComplete = (invoice: InvoiceRecord, file: File) => {
    setReviewInvoice(invoice);
    setReviewFile(file);
  };

  const handleApprove = async (approvedInvoice: InvoiceRecord) => {
    try {
      const { line_items, id, ...invoiceData } = approvedInvoice;

      const { data: newInvoice, error: invError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invError) throw invError;

      if (line_items && line_items.length > 0) {
        const lineItemsWithInvoiceId = line_items.map(item => {
          const { id: _id, invoice_id: _invId, ...rest } = item;
          return {
            ...rest,
            invoice_id: newInvoice.id
          };
        });

        const { data: insertedLines, error: liError } = await supabase
          .from('invoice_line_items')
          .insert(lineItemsWithInvoiceId)
          .select();

        if (liError) throw liError;
        newInvoice.line_items = insertedLines;
      } else {
        newInvoice.line_items = [];
      }

      setInvoices(prev => [newInvoice, ...prev]);
      toast.success('Invoice added to the Great Ledger.');
      setReviewInvoice(null);
      setReviewFile(null);
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast.error('Error saving invoice: ' + error.message);
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

  if (reviewInvoice) {
    return (
      <PageContainer scrollable={false}>
        <div className="mx-auto max-w-6xl w-full h-full">
          <ExtractionReview 
            invoice={reviewInvoice} 
            file={reviewFile!}
            onApprove={handleApprove} 
            onCancel={() => {
              setReviewInvoice(null);
              setReviewFile(null);
            }} 
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in duration-500 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card/40 backdrop-blur-md px-6 py-5 rounded-2xl border border-border/40 shadow-sm">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="hover:opacity-80 transition-opacity flex aspect-square size-14 shrink-0 items-center justify-center rounded-xl bg-white border border-border/50 p-1.5 shadow-sm">
              <img src="/logo.jpeg" alt="Sumer Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-sans font-bold tracking-tight text-3xl md:text-4xl leading-normal pb-1 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-yellow-200 dark:to-amber-500 bg-clip-text text-transparent">Ledger of Sumer</h1>
              <p className="text-foreground/60 text-sm font-medium tracking-wide mt-1">"Turn every invoice into a perfect record."</p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <ExportButton invoices={invoices} />
            <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:scale-[1.02] transition-all duration-200">
              <UploadCloud className="h-4 w-4" /> Upload Invoice
            </Button>
          </div>
        </div>

        <DashboardStats invoices={invoices} />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 backdrop-blur-md bg-card/40 border border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Extraction Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview invoices={invoices} />
            </CardContent>
          </Card>
          <Card className="col-span-3 backdrop-blur-md bg-card/40 border border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                You have {invoices.length} total processed documents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentInvoices invoices={invoices} />
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center backdrop-blur-sm bg-card/30 rounded-xl border border-border/50">
            <div className="animate-pulse flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              Reading the great ledger...
            </div>
          </div>
        ) : (
          <div className="pt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold tracking-tight">Recent Ledger Entries</h2>
              <Button render={<Link href="/invoices" />} nativeButton={false} variant="ghost" className="text-muted-foreground hover:text-primary">
                View All
              </Button>
            </div>
            <LedgerTable 
              invoices={invoices.slice(0, 5)} 
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          </div>
        )}

        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
          onExtractionComplete={handleExtractionComplete} 
        />
      </div>
    </PageContainer>
  );
}
