export type ExtractionProgressState =
  | 'idle'
  | 'Uploading tablet to scribes...'
  | 'Scribes are transcribing...'
  | 'Validating extracted sums...'
  | 'Ledger entry prepared ✓';

import { InvoiceRecord } from '@/types/invoice';

export async function extractInvoiceMock(
  file: File,
  onProgress: (state: ExtractionProgressState) => void
): Promise<InvoiceRecord> {
  onProgress('Uploading tablet to scribes...');
  
  const formData = new FormData();
  formData.append('file', file);
  
  // Wait a small amount to simulate UX upload feel
  await new Promise(resolve => setTimeout(resolve, 800));
  
  onProgress('Scribes are transcribing...');
  
  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract invoice');
    }
    
    onProgress('Validating extracted sums...');
    const data = await response.json();
    
    await new Promise(resolve => setTimeout(resolve, 500));
    onProgress('Ledger entry prepared ✓');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return data as InvoiceRecord;
  } catch (error: any) {
    console.error('Extraction Error:', error);
    throw new Error('Our scribes failed to read the tablet. ' + error.message);
  }
}
