import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const months = [1, 2, 3, 4, 5, 6, 7]; // Jan to Jul
    const vendors = ['Acme Corp', 'Stark Industries', 'Wayne Enterprises', 'Cyberdyne', 'Umbrella Corp'];
    
    for (const month of months) {
      // 2-3 invoices per month
      const numInvoices = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < numInvoices; i++) {
        const vendor = vendors[Math.floor(Math.random() * vendors.length)];
        const day = Math.floor(Math.random() * 28) + 1;
        const date = new Date(2024, month - 1, day).toISOString().split('T')[0];
        const amount = Math.floor(Math.random() * 5000) + 500;
        
        const { data: invoice, error } = await supabase.from('invoices').insert({
          invoice_number: `INV-${month}00${i}`,
          invoice_date: date,
          vendor_name: vendor,
          subtotal: amount * 0.9,
          tax: amount * 0.1,
          total_amount: amount,
          currency: 'INR',
          payment_status: Math.random() > 0.5 ? 'Paid' : 'Pending',
          confidence: Math.floor(Math.random() * 15) + 85,
        }).select().single();

        if (error) {
          console.error("Error inserting invoice:", error);
          continue;
        }

        // Generate 2-4 line items
        const numItems = Math.floor(Math.random() * 3) + 2;
        const lineItems = [];
        let remainingAmount = amount * 0.9; // distribute subtotal

        for (let j = 0; j < numItems; j++) {
          const isLast = j === numItems - 1;
          const itemAmount = isLast ? remainingAmount : remainingAmount * (Math.random() * 0.5 + 0.2);
          remainingAmount -= itemAmount;
          
          const qty = Math.floor(Math.random() * 5) + 1;
          
          lineItems.push({
            invoice_id: invoice.id,
            description: `Dummy Service / Product ${j + 1} (${vendor})`,
            quantity: qty,
            unit_price: itemAmount / qty,
            amount: itemAmount
          });
        }

        await supabase.from('invoice_line_items').insert(lineItems);
      }
    }

    return NextResponse.json({ success: true, message: 'Seeded successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
