import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { formatCurrency } from '../../utils/formatters';

interface PrintBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any[];
}

export const PrintBillModal: React.FC<PrintBillModalProps> = ({
  isOpen,
  onClose,
  sale
}) => {
  const [selectedBillIndex, setSelectedBillIndex] = useState(0);

  const handlePrint = () => {
    window.print();
  };

  const consolidatedBill = useMemo(() => {
    if (sale.length <= 1) return null;

    const allItems = sale.flatMap(bill => bill.items);
    const totalAmount = allItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const subtotal = allItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const totalDiscount = allItems.reduce((sum, item) => sum + (item.discountValue || 0), 0);
    const totalGst = allItems.reduce((sum, item) => sum + (item.gstAmount || 0), 0);

    return {
      items: allItems,
      totalAmount,
      subtotal,
      totalDiscount,
      totalGst,
      customerName: sale[0].customerName,
      customerMobile: sale[0].customerMobile,
      taxInvoiceNo: sale[0].taxInvoiceNo,
      estimateNo: sale[0].estimateNo,
      priceLevel: sale[0].priceLevel,
    };
  }, [sale]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Generated Bills</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={sale[0]?.companyName} className="w-full">
          <TabsList className="w-full">
            {sale.map((bill, index) => (
              <TabsTrigger 
                key={bill.companyName} 
                value={bill.companyName}
                onClick={() => setSelectedBillIndex(index)}
              >
                {bill.companyName}
              </TabsTrigger>
            ))}
            {consolidatedBill && (
              <TabsTrigger value="consolidated">Consolidated</TabsTrigger>
            )}
          </TabsList>

          {sale.map((bill, index) => (
            <TabsContent key={bill.companyName} value={bill.companyName}>
              <Card className="p-6">
                <div className="space-y-4">
                  {/* Bill Header */}
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold">{bill.companyName}</h2>
                    <p>Bill No: {bill.billNumber}</p>
                    <p>Date: {new Date(bill.date).toLocaleDateString()}</p>
                  </div>

                  {/* Customer Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Customer:</strong> {bill.customerName}</p>
                      {bill.customerMobile && <p><strong>Mobile:</strong> {bill.customerMobile}</p>}
                      {bill.taxInvoiceNo && <p><strong>Tax Invoice No:</strong> {bill.taxInvoiceNo}</p>}
                    </div>
                    <div className="text-right">
                      {bill.estimateNo && <p><strong>Estimate No:</strong> {bill.estimateNo}</p>}
                      <p><strong>Bill Type:</strong> {bill.billType}</p>
                      {bill.priceLevel && <p><strong>Price Level:</strong> {bill.priceLevel}</p>}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Item</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Unit</th>
                          <th className="text-right p-2">Rate</th>
                          <th className="text-right p-2">GST%</th>
                          <th className="text-right p-2">Disc</th>
                          <th className="text-right p-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{item.name}</td>
                            <td className="text-right p-2">{item.quantity}</td>
                            <td className="text-right p-2">{item.salesUnit}</td>
                            <td className="text-right p-2">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-right p-2">{item.gstPercentage || '-'}</td>
                            <td className="text-right p-2">
                              {item.discountValue ? formatCurrency(item.discountValue) : '-'}
                            </td>
                            <td className="text-right p-2">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bill Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-end space-y-2">
                      <div className="w-48">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(bill.items.reduce((sum: number, item: any) => 
                            sum + (item.unitPrice * item.quantity), 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>{formatCurrency(bill.items.reduce((sum: number, item: any) => 
                            sum + (item.discountValue || 0), 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST:</span>
                          <span>{formatCurrency(bill.items.reduce((sum: number, item: any) => 
                            sum + (item.gstAmount || 0), 0))}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(bill.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          ))}

          {consolidatedBill && (
            <TabsContent value="consolidated">
              <Card className="p-6">
                <div className="space-y-4">
                  {/* Consolidated Bill Header */}
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold">Consolidated Bill</h2>
                    <p>Date: {new Date().toLocaleDateString()}</p>
                  </div>

                  {/* Customer Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p><strong>Customer:</strong> {consolidatedBill.customerName}</p>
                      {consolidatedBill.customerMobile && <p><strong>Mobile:</strong> {consolidatedBill.customerMobile}</p>}
                      {consolidatedBill.taxInvoiceNo && <p><strong>Tax Invoice No:</strong> {consolidatedBill.taxInvoiceNo}</p>}
                    </div>
                    <div className="text-right">
                      {consolidatedBill.estimateNo && <p><strong>Estimate No:</strong> {consolidatedBill.estimateNo}</p>}
                      <p><strong>Bill Type:</strong> CONSOLIDATED</p>
                      {consolidatedBill.priceLevel && <p><strong>Price Level:</strong> {consolidatedBill.priceLevel}</p>}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Item</th>
                          <th className="text-left p-2">Company</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Unit</th>
                          <th className="text-right p-2">Rate</th>
                          <th className="text-right p-2">GST%</th>
                          <th className="text-right p-2">Disc</th>
                          <th className="text-right p-2">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consolidatedBill.items.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">{item.companyName}</td>
                            <td className="text-right p-2">{item.quantity}</td>
                            <td className="text-right p-2">{item.salesUnit}</td>
                            <td className="text-right p-2">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-right p-2">{item.gstPercentage || '-'}</td>
                            <td className="text-right p-2">
                              {item.discountValue ? formatCurrency(item.discountValue) : '-'}
                            </td>
                            <td className="text-right p-2">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Bill Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-end space-y-2">
                      <div className="w-48">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(consolidatedBill.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>{formatCurrency(consolidatedBill.totalDiscount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST:</span>
                          <span>{formatCurrency(consolidatedBill.totalGst)}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span>{formatCurrency(consolidatedBill.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="space-x-2">
            <Button onClick={handlePrint}>
              Print Current Bill
            </Button>
            <Button onClick={() => window.print()}>
              Print All Bills
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
