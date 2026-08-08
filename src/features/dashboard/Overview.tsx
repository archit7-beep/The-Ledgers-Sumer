import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { InvoiceRecord } from "@/types/invoice";

interface OverviewProps {
  invoices: InvoiceRecord[];
}

export function Overview({ invoices }: OverviewProps) {
  // Aggregate totals by date
  const data = invoices.reduce((acc: any[], invoice) => {
    if (!invoice.invoice_date) return acc;
    const date = new Date(invoice.invoice_date);
    // Format like 'Aug 12'
    const dateStr = date.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    
    const existing = acc.find(item => item.name === dateStr);
    if (existing) {
      existing.total += invoice.total_amount || 0;
    } else {
      acc.push({
        name: dateStr,
        total: invoice.total_amount || 0,
        rawDate: date.getTime(), // keep for sorting
      });
    }
    return acc;
  }, []);

  // Sort chronologically
  data.sort((a, b) => a.rawDate - b.rawDate);

  // Fix: AreaCharts cannot draw a line with only 1 data point.
  // We will pad it with an empty day prior to the data point to create a mountain peak effect.
  if (data.length === 1) {
    const singlePoint = data[0];
    const prevDate = new Date(singlePoint.rawDate - 86400000); // subtract 1 day
    const prevDateStr = prevDate.toLocaleDateString('default', { month: 'short', day: 'numeric' });
    
    data.unshift({
      name: prevDateStr,
      total: 0,
      rawDate: prevDate.getTime(),
    });
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        No chart data available. Upload invoices to see trends.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip 
          formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Total']}
          cursor={{stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3'}}
          contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
          itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorTotal)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
