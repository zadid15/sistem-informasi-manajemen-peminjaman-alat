import React from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  qrCodeUrl: string;
  data: {
    label: string;
    value: string;
  }[];
}

export function QRCodeModal({ isOpen, onClose, title, qrCodeUrl, data }: QRCodeModalProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                text-align: center;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
              }
              img {
                margin: 20px 0;
              }
              .info {
                text-align: left;
                max-width: 400px;
                margin: 20px auto;
              }
              .info-row {
                margin: 10px 0;
                padding: 10px;
                border-bottom: 1px solid #eee;
              }
              .info-label {
                font-weight: bold;
                color: #666;
                font-size: 12px;
              }
              .info-value {
                font-size: 14px;
                margin-top: 5px;
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <img src="${qrCodeUrl}" alt="QR Code" />
            <div class="info">
              ${data.map(item => `
                <div class="info-row">
                  <div class="info-label">${item.label}</div>
                  <div class="info-value">${item.value}</div>
                </div>
              `).join('')}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code Display */}
          <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
          </div>

          {/* Data Information */}
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex justify-between items-start py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
                <span className="text-sm text-gray-900 text-right">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="w-4 h-4 mr-2" />
              Cetak
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Unduh
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
