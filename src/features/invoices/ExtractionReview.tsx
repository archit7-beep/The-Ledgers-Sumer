import { InvoiceRecord } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExtractionReviewProps {
  invoice: InvoiceRecord;
  file: File;
  onApprove: (invoice: InvoiceRecord) => void;
  onCancel: () => void;
}

const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY'];

export function ExtractionReview({ invoice, file, onApprove, onCancel }: ExtractionReviewProps) {
  const [fileUrl, setFileUrl] = useState<string>('');
  
  // Currency Converter State
  const baseCurrency = invoice.currency?.toUpperCase() || 'USD';
  const [targetCurrency, setTargetCurrency] = useState(baseCurrency);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isFetchingRates, setIsFetchingRates] = useState(false);

  const [editableInvoice, setEditableInvoice] = useState<InvoiceRecord>(invoice);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    const fetchRates = async () => {
      setIsFetchingRates(true);
      try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
        if (!res.ok) throw new Error('Failed to fetch rates');
        const data = await res.json();
        setRates(data.rates);
        
        if (!COMMON_CURRENCIES.includes(baseCurrency)) {
          COMMON_CURRENCIES.push(baseCurrency);
        }
      } catch (error) {
        console.error('Exchange rate error:', error);
      } finally {
        setIsFetchingRates(false);
      }
    };
    
    if (baseCurrency) {
      fetchRates();
    }
  }, [baseCurrency]);

  const exchangeRate = rates[targetCurrency] || 1;
  const isConverted = targetCurrency !== baseCurrency;

  const convertAmount = (amount: number | undefined) => {
    if (!amount && amount !== 0) return '0.00';
    return (amount * exchangeRate).toFixed(2);
  };

  const currencySymbol = isConverted ? targetCurrency : baseCurrency;

  // Dynamic Math Recalculation
  const handleLineItemChange = (index: number, field: 'quantity' | 'unit_price', value: string) => {
    const numValue = parseFloat(value) || 0;
    const newItems = [...(editableInvoice.line_items || [])];
    const item = { ...newItems[index] };
    
    if (field === 'quantity') item.quantity = numValue;
    if (field === 'unit_price') item.unit_price = numValue;
    
    item.amount = (item.quantity || 0) * (item.unit_price || 0);
    newItems[index] = item;

    // Recalculate totals
    const subtotal = newItems.reduce((sum, it) => sum + (it.amount || 0), 0);
    const taxRate = (invoice.subtotal && invoice.subtotal > 0) ? ((invoice.tax || 0) / invoice.subtotal) : 0;
    const tax = subtotal * taxRate;
    const total_amount = subtotal + tax;

    setEditableInvoice(prev => ({
      ...prev,
      line_items: newItems,
      subtotal,
      tax,
      total_amount
    }));
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-2xl backdrop-blur-md bg-card/60 border border-border/50 flex flex-col h-[85vh]">
      <CardHeader className="border-b border-border/50 bg-muted/30 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              Extraction Review
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                High Confidence
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Verify and edit the extracted fields. Math will recalculate automatically.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="gap-2 backdrop-blur-sm bg-background/50">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
            <Button onClick={() => onApprove(editableInvoice)} className="gap-2 shadow-lg shadow-primary/20">
              <CheckCircle className="h-4 w-4" /> Approve & Add to Ledger
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="flex h-full flex-col md:flex-row">
          
          {/* Left Side: Document Preview */}
          <div className="md:w-1/2 p-6 border-r border-border/50 bg-muted/10 flex flex-col h-full overflow-hidden">
            <h3 className="text-lg font-medium mb-4 shrink-0">Document Preview</h3>
            <div className="w-full flex-1 flex items-center justify-center bg-card/40 rounded-xl border border-border/50 backdrop-blur-sm overflow-hidden relative group">
              {fileUrl ? (
                file.type === 'application/pdf' ? (
                  <iframe src={`${fileUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-0 rounded-xl" title="Document Preview" />
                ) : (
                  <img src={fileUrl} alt="Document Preview" className="max-w-full max-h-full object-contain rounded-xl" />
                )
              ) : (
                <div className="text-center space-y-2 text-muted-foreground">
                  <p className="font-medium">No Preview Available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right Side: Extracted Fields */}
          <div className="md:w-1/2 p-6 overflow-y-auto space-y-6 flex flex-col h-full">
            <div className="flex items-center justify-between shrink-0">
              <h3 className="text-lg font-medium">Extracted Data</h3>
              
              <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50 shadow-sm">
                <RefreshCw className={`h-4 w-4 text-muted-foreground ${isFetchingRates ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium text-muted-foreground">Convert:</span>
                <Select value={targetCurrency} onValueChange={(val) => { if (val) setTargetCurrency(val); }} disabled={isFetchingRates || Object.keys(rates).length === 0}>
                  <SelectTrigger className="h-7 border-0 bg-transparent shadow-none focus:ring-0 p-0 text-sm font-bold w-[120px] text-right">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border/50 shadow-lg z-50">
                    <SelectItem value={baseCurrency}>{baseCurrency} (Original)</SelectItem>
                    {Object.keys(rates).length > 0 && COMMON_CURRENCIES.filter(c => c !== baseCurrency).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <div className="space-y-2">
                <Label>Vendor Name</Label>
                <Input 
                  value={editableInvoice.vendor_name || ''} 
                  onChange={e => setEditableInvoice({...editableInvoice, vendor_name: e.target.value})}
                  className="bg-background/50" 
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input 
                  value={editableInvoice.invoice_number || ''} 
                  onChange={e => setEditableInvoice({...editableInvoice, invoice_number: e.target.value})}
                  className="bg-background/50" 
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  value={editableInvoice.invoice_date || ''} 
                  type="date" 
                  onChange={e => setEditableInvoice({...editableInvoice, invoice_date: e.target.value})}
                  className="bg-background/50" 
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={baseCurrency} readOnly className="bg-background/50 opacity-70" />
              </div>
            </div>

            <div className="space-y-4 shrink-0">
              <Label className="text-base flex justify-between">
                Line Items
                {isConverted && <span className="text-xs font-normal text-muted-foreground">Converted to {targetCurrency} @ {exchangeRate.toFixed(4)}</span>}
              </Label>
              <div className="rounded-md border border-border/50 overflow-hidden bg-background/40">
                <div className="grid grid-cols-12 gap-2 p-3 bg-muted/30 text-sm font-medium border-b border-border/50">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2 text-right">Qty</div>
                  <div className="col-span-3 text-right">Unit ({currencySymbol})</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                {editableInvoice.line_items?.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 p-2 text-sm items-center border-b border-border/10 last:border-0">
                    <div className="col-span-5 text-xs truncate pr-2" title={item.description}>{item.description}</div>
                    <div className="col-span-2">
                      <Input 
                        type="number" 
                        value={item.quantity || ''}
                        onChange={(e) => handleLineItemChange(i, 'quantity', e.target.value)}
                        className="h-7 text-right px-1 text-xs" 
                      />
                    </div>
                    <div className="col-span-3">
                      <Input 
                        type="number" 
                        value={isConverted ? (item.unit_price ? (item.unit_price * exchangeRate).toFixed(2) : '') : (item.unit_price || '')}
                        onChange={(e) => {
                          // If it's converted, user input must be divided back to base currency to store correctly
                          const val = e.target.value;
                          const num = parseFloat(val);
                          const storeVal = (isConverted && !isNaN(num)) ? (num / exchangeRate).toString() : val;
                          handleLineItemChange(i, 'unit_price', storeVal);
                        }}
                        className="h-7 text-right px-1 text-xs" 
                      />
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {currencySymbol} {convertAmount(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 shrink-0 mt-auto">
              <div className="col-start-2 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{currencySymbol} {convertAmount(editableInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{currencySymbol} {convertAmount(editableInvoice.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50 text-primary">
                  <span>Total Amount</span>
                  <span>{currencySymbol} {convertAmount(editableInvoice.total_amount)}</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
