import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are a strict data extraction AI for the Ledger of Sumer. 
Extract invoice details from the user's input (image or raw text).
You MUST respond with a valid JSON object matching exactly this schema, and nothing else.
If a field is not found, use null or 0.

Schema:
{
  "vendor_name": "Extracted Vendor Name",
  "invoice_number": "Extracted Invoice Number String or null",
  "invoice_date": "YYYY-MM-DD formatted date string or null",
  "currency": "USD (or whatever currency is used, e.g. EUR, GBP)",
  "subtotal": 0.00,
  "tax": 0.00,
  "total_amount": 0.00,
  "line_items": [
    {
      "description": "EXACT item description as written on the invoice. DO NOT summarize or truncate.",
      "quantity": 1,
      "unit_price": 0.00,
      "amount": 0.00
    }
  ]
}

DO NOT wrap the response in markdown blocks (e.g. \`\`\`json). Return raw JSON only.`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawText = formData.get('rawText') as string | null;

    if (!file && !rawText) {
      return NextResponse.json({ error: 'No file or raw text provided' }, { status: 400 });
    }

    let messages: any[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      }
    ];

    let model = 'llama-3.3-70b-versatile'; // Default for text

    if (file) {
      const mimeType = file.type;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // For images, we use Vision models
      if (mimeType.startsWith('image/')) {
        model = 'llama-3.2-11b-vision-preview';
        const base64Image = buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: 'Extract the invoice data from this image strictly following the JSON schema.' },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        });
      } else if (mimeType === 'application/pdf') {
        // Parse PDF to text using pdf2json to avoid DOMMatrix/pdfjs issues
        const PDFParser = require('pdf2json');
        
        const extractedText = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser(null, 1);
          pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
          pdfParser.on("pdfParser_dataReady", () => {
            resolve(pdfParser.getRawTextContent());
          });
          pdfParser.parseBuffer(buffer);
        });
        
        messages.push({
          role: 'user',
          content: `Extract the invoice data from the following text strictly following the JSON schema:\n\n${extractedText}`
        });
      } else {
        return NextResponse.json({ 
          error: 'Unsupported file format for AI Vision. Please upload a PNG, JPEG, or PDF.' 
        }, { status: 415 });
      }
    } else if (rawText) {
      messages.push({
        role: 'user',
        content: `Extract the invoice data from the following text strictly following the JSON schema:\n\n${rawText}`
      });
    }

    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Groq returned empty content');
    }

    const extractedData = JSON.parse(content);
    
    return NextResponse.json(extractedData);

  } catch (error: any) {
    console.error('Error in Groq extraction API:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract data' }, { status: 500 });
  }
}
