import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { extractInvoiceMock, ExtractionProgressState } from '@/services/extractInvoice';
import { InvoiceRecord } from '@/types/invoice';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractionComplete: (invoice: InvoiceRecord, file: File) => void;
}

export function UploadModal({ isOpen, onClose, onExtractionComplete }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progressState, setProgressState] = useState<ExtractionProgressState>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsExtracting(true);
    setProgressState('idle');
    try {
      const extracted = await extractInvoiceMock(file, (state) => setProgressState(state));
      onExtractionComplete(extracted, file);
      setFile(null);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsExtracting(false);
      setProgressState('idle');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 border border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Upload Invoice</DialogTitle>
          <DialogDescription>
            Upload an invoice, receipt, or trade document to extract data automatically.
          </DialogDescription>
        </DialogHeader>
        
        {!isExtracting ? (
          <div className="flex flex-col gap-4 py-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${file ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".pdf,.png,.jpg,.jpeg"
              />
              
              {file ? (
                <>
                  <File className="h-10 w-10 text-primary mb-2" />
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </>
              ) : (
                <>
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="font-medium text-sm">Click or drag file to this area to upload</p>
                  <p className="text-xs text-muted-foreground mt-1">Supports PDF, PNG, JPG</p>
                </>
              )}
            </div>

            <Button 
              className="w-full" 
              disabled={!file} 
              onClick={handleExtract}
            >
              Extract with AI
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
              <div className="absolute inset-0 rounded-full border-r-2 border-primary/30 animate-[spin_1.5s_linear_infinite]"></div>
              {progressState === 'Ledger entry prepared ✓' ? (
                 <CheckCircle2 className="h-8 w-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              ) : (
                <AlertCircle className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              )}
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-primary tracking-tight transition-all duration-300">
                {progressState}
              </h3>
              <p className="text-sm text-muted-foreground">Please wait while our scribes read the tablet...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
