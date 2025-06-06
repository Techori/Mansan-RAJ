import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { SaleItem } from '../../types';

interface SaleItemsTableProps {
  items: SaleItem[];
  onRemoveItem: (index: number) => void;
  onOpenDiscountDialog: (index: number) => void;
}

const SaleItemsTable: React.FC<SaleItemsTableProps> = ({
  items,
  onRemoveItem,
  onOpenDiscountDialog,
}) => {
  // Split items into GST and non-GST items
  const gstItems = items.filter(item => item.gstPercentage !== undefined && item.gstPercentage > 0);
  const nonGstItems = items.filter(item => item.gstPercentage === undefined || item.gstPercentage === 0);
  
  const renderTable = (tableItems: SaleItem[], title: string, emptyMessage: string) => (
    <Card className="p-0 overflow-hidden mb-4">
      <div className="bg-muted px-4 py-2 border-b">
        <h3 className="font-medium text-sm">{title}</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Item</TableHead>
            <TableHead className="text-center">Qty</TableHead>
            <TableHead className="text-right">MRP</TableHead>
            <TableHead className="text-right">Excl. GST</TableHead>
            <TableHead className="text-right">Discount</TableHead>
            <TableHead className="text-right">GST</TableHead>
            <TableHead className="text-right">Net Amount</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableItems.length > 0 ? (
            tableItems.map((item, index) => {
              // Find the original index in the combined items array
              const originalIndex = items.findIndex(i => i === item);
              
              return (
                <TableRow key={originalIndex}>
                  <TableCell>{item.companyName}</TableCell>
                  <TableCell>
                    {item.name}
                    {item.hsnCode && (
                      <div className="text-xs text-gray-500">HSN: {item.hsnCode}</div>
                    )}
                    {item.packagingDetails && (
                      <div className="text-xs text-gray-500">{item.packagingDetails}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{item.quantity} {item.salesUnit}</TableCell>
                  <TableCell className="text-right">₹{((item.mrp || item.unitPrice) || 0)}</TableCell>
                  <TableCell className="text-right">
                    ₹{Number(item.unitPrice).toFixed(2)} 
                    <div className="text-xs text-gray-500">
                      ₹{Number((item.unitPrice * item.quantity)).toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {item.discountValue ? (
                      <>
                        ₹{Number(item.discountValue).toFixed(2)}
                        {item.discountPercentage && (
                          <div className="text-xs text-gray-500">
                            {item.discountPercentage}%
                          </div>
                        )}
                      </>
                    ) : (
                      '₹0.00'
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.gstPercentage ? (
                      <>
                        {item.gstPercentage}%
                        <div className="text-xs text-gray-500">
                          ₹{(item.gstAmount || 0).toFixed(2)}
                        </div>
                      </>
                    ) : (
                      '0%'
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">₹{Number(item.totalPrice).toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenDiscountDialog(originalIndex)}
                        className="h-7 w-7 text-blue-600"
                        title="Apply Discount"
                      >
                        %
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveItem(originalIndex)}
                        className="h-7 w-7 text-red-500"
                        title="Remove Item"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
  
  return (
    <div>
      {renderTable(gstItems, "GST Items", "No GST items added yet")}
      {renderTable(nonGstItems, "Non-GST Items", "No non-GST items added yet")}
    </div>
  );
};

export default SaleItemsTable; 