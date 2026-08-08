import { useState } from 'react';
import { InvoiceRecord } from '@/types/invoice';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit2, Trash2, Check, X, FileText, Pin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface LedgerTableProps {
  invoices: InvoiceRecord[];
  onUpdate?: (invoice: InvoiceRecord) => void;
  onDelete?: (id: string) => void;
}

export function LedgerTable({ invoices, onUpdate, onDelete }: LedgerTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InvoiceRecord>>({});
  const [viewInvoice, setViewInvoice] = useState<InvoiceRecord | null>(null);
  
  // Sort pinned first, then by date descending
  const sortedInvoices = [...invoices].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    return new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime();
  });

  const filteredInvoices = sortedInvoices.filter(inv => 
    inv.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.payment_status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePin = async (invoice: InvoiceRecord) => {
    try {
      const newPinnedStatus = !invoice.is_pinned;
      const { error } = await supabase
        .from('invoices')
        .update({ is_pinned: newPinnedStatus })
        .eq('id', invoice.id);
        
      if (error) throw error;
      
      if (onUpdate) {
        onUpdate({ ...invoice, is_pinned: newPinnedStatus });
      }
      toast.success(newPinnedStatus ? 'Invoice pinned' : 'Invoice unpinned');
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      toast.error('Failed to update pin status');
    }
  };

  const formatCurrency = (amount: number, currency?: string | null) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleEditClick = (invoice: InvoiceRecord) => {
    if (!invoice.id) return;
    setEditingId(invoice.id);
    setEditForm(invoice);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = () => {
    if (onUpdate && editForm.id) {
      onUpdate(editForm as InvoiceRecord);
    }
    setEditingId(null);
  };

  return (
    <Card className="backdrop-blur-md bg-card/40 border border-border/50 shadow-lg mt-8">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl">Great Ledger</CardTitle>
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search vendor, invoice..." 
            className="pl-9 h-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border/50 bg-background/50 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    No ledger entries found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((inv) => {
                  const isEditing = editingId === inv.id;

                  return (
                    <TableRow key={inv.id || inv.invoice_number} className="group">
                      {/* Invoice Number */}
                      <TableCell className="font-medium">
                        {isEditing ? (
                          <Input 
                            value={editForm.invoice_number || ''} 
                            onChange={e => setEditForm({...editForm, invoice_number: e.target.value})}
                            className="h-8 text-xs w-24"
                          />
                        ) : inv.invoice_number}
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            type="date"
                            value={editForm.invoice_date || ''} 
                            onChange={e => setEditForm({...editForm, invoice_date: e.target.value})}
                            className="h-8 text-xs w-32"
                          />
                        ) : new Date(inv.invoice_date).toLocaleDateString('en-US', { 
                          month: 'short', day: 'numeric', year: 'numeric' 
                        })}
                      </TableCell>

                      {/* Vendor */}
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            value={editForm.vendor_name || ''} 
                            onChange={e => setEditForm({...editForm, vendor_name: e.target.value})}
                            className="h-8 text-xs"
                          />
                        ) : (
                          <button 
                            onClick={() => setViewInvoice(inv)}
                            className="font-medium text-primary hover:underline flex items-center gap-1.5 transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5 opacity-70" />
                            {inv.vendor_name}
                            {inv.line_items && inv.line_items.length > 0 && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold ml-1">
                                {inv.line_items.length}
                              </span>
                            )}
                          </button>
                        )}
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="text-right font-medium">
                        {isEditing ? (
                          <Input 
                            type="number"
                            value={editForm.total_amount || 0} 
                            onChange={e => setEditForm({...editForm, total_amount: parseFloat(e.target.value)})}
                            className="h-8 text-xs w-24 text-right ml-auto"
                          />
                        ) : formatCurrency(inv.total_amount, inv.currency)}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        {isEditing ? (
                          <select 
                            className="h-8 text-xs flex w-full rounded-md border border-input bg-background px-3 py-1 ring-offset-background"
                            value={editForm.payment_status || 'Pending'}
                            onChange={e => setEditForm({...editForm, payment_status: e.target.value as any})}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                          </select>
                        ) : (
                          <Badge variant={inv.payment_status === 'Paid' ? 'default' : inv.payment_status === 'Pending' ? 'secondary' : 'destructive'} className="font-normal text-xs">
                            {inv.payment_status || 'Pending'}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Confidence */}
                      <TableCell>
                        <Badge variant="outline" className={`font-normal ${inv.confidence && inv.confidence > 90 ? 'text-emerald-500 border-emerald-200 bg-emerald-500/10' : 'text-amber-500 border-amber-200 bg-amber-500/10'}`}>
                          {inv.confidence || 100}%
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10">
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={handleCancelEdit} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => togglePin(inv)} 
                                className={`h-8 w-8 transition-opacity ${inv.is_pinned ? 'text-amber-500 opacity-100 hover:bg-amber-500/10' : 'opacity-0 group-hover:opacity-100'}`}
                                title={inv.is_pinned ? "Unpin invoice" : "Pin invoice"}
                              >
                                <Pin className={`h-4 w-4 ${inv.is_pinned ? 'fill-current' : ''}`} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(inv)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => inv.id && onDelete && onDelete(inv.id)} className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              Invoice Details: {viewInvoice?.vendor_name}
            </DialogTitle>
            <DialogDescription>
              Invoice {viewInvoice?.invoice_number} • Date: {viewInvoice?.invoice_date ? new Date(viewInvoice.invoice_date).toLocaleDateString() : 'N/A'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 rounded-lg border border-border/50 bg-muted/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-1/2">Item Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right font-bold">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {viewInvoice?.line_items && viewInvoice.line_items.length > 0 ? (
                  viewInvoice.line_items.map((item, i) => (
                    <TableRow key={i} className="hover:bg-background/40">
                      <TableCell className="text-sm">{item.description}</TableCell>
                      <TableCell className="text-right text-sm">{item.quantity || '-'}</TableCell>
                      <TableCell className="text-right text-sm">{item.unit_price ? formatCurrency(item.unit_price, viewInvoice.currency) : '-'}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{item.amount ? formatCurrency(item.amount, viewInvoice.currency) : '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No line items found for this invoice.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex flex-col gap-1 items-end pt-4 pr-4">
            <div className="flex justify-between w-48 text-sm text-muted-foreground">
              <span>Subtotal:</span>
              <span>{formatCurrency(viewInvoice?.subtotal || 0, viewInvoice?.currency)}</span>
            </div>
            <div className="flex justify-between w-48 text-sm text-muted-foreground pb-2 border-b border-border/50">
              <span>Tax:</span>
              <span>{formatCurrency(viewInvoice?.tax || 0, viewInvoice?.currency)}</span>
            </div>
            <div className="flex justify-between w-48 text-lg font-bold text-primary pt-1">
              <span>Total:</span>
              <span>{formatCurrency(viewInvoice?.total_amount || 0, viewInvoice?.currency)}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
