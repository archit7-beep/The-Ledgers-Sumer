export type PaymentStatus = 'Pending' | 'Paid' | 'Overdue';

export interface LineItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface InvoiceRecord {
  id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  vendor_name: string;
  vendor_address: string;
  customer_name: string;
  currency: string;
  subtotal: number;
  tax: number;
  total_amount: number;
  payment_status: PaymentStatus;
  confidence?: number;
  line_items?: LineItem[];
  is_pinned?: boolean;
}
