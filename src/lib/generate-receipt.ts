import jsPDF from 'jspdf';
import { formatUGX } from '@/data/mock-data';

const METHOD_LABELS: Record<string, string> = {
  mtn_momo: 'MTN MoMo',
  airtel_money: 'Airtel Money',
  cash: 'Cash',
  bank_transfer: 'Bank Transfer',
  pesapal: 'Pesapal',
};

interface ReceiptData {
  payment: {
    id: string;
    amount: number;
    payment_date: string;
    method: string;
    reference?: string | null;
    status: string;
  };
  tenantName: string;
  propertyName?: string;
  unitName?: string;
}

export function downloadReceipt({ payment, tenantName, propertyName, unitName }: ReceiptData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a5' });
  const w = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header bar
  doc.setFillColor(45, 143, 78); // primary green
  doc.rect(0, 0, w, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT RECEIPT', w / 2, y, { align: 'center' });
  y = 40;

  // Receipt number
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${payment.id.slice(0, 8).toUpperCase()}`, w / 2, y, { align: 'center' });
  y += 12;

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, w - 14, y);
  y += 10;

  // Details
  const fields: [string, string][] = [
    ['Tenant', tenantName],
    ['Property', [propertyName, unitName].filter(Boolean).join(' · ') || '—'],
    ['Date', payment.payment_date],
    ['Method', METHOD_LABELS[payment.method] || payment.method],
    ['Amount', formatUGX(payment.amount)],
    ['Status', payment.status.charAt(0).toUpperCase() + payment.status.slice(1)],
  ];

  if (payment.reference) {
    fields.push(['Reference', payment.reference]);
  }

  doc.setFontSize(10);
  for (const [label, value] of fields) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 80);
    doc.text(label, 16, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(value, w - 16, y, { align: 'right' });
    y += 8;
  }

  // Divider
  y += 4;
  doc.line(14, y, w - 14, y);
  y += 10;

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('This is a system-generated receipt.', w / 2, y, { align: 'center' });
  y += 5;
  doc.text(`Generated: ${new Date().toLocaleString()}`, w / 2, y, { align: 'center' });

  doc.save(`receipt-${payment.id.slice(0, 8)}.pdf`);
}
