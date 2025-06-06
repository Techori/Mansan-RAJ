import React, { useState, useMemo, useEffect } from 'react';
import { useSales } from '../../contexts/SalesContext';
import { Sale } from '../../types';
import { useInventory } from '../../contexts/InventoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Eye, Calendar, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { useCompany } from '../../contexts/CompanyContext';
import { toast } from 'sonner';
import { PrintBillModal } from './PrintBillModal';
import Loader from '../ui/loader';

const SalesList: React.FC = () => {
  const { filteredSales } = useSales();
  const { filteredGodowns } = useInventory();
  const { currentCompany } = useCompany();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize loading state
  useEffect(() => {
    if (filteredSales !== undefined) {
      setIsLoading(false);
    }
  }, [filteredSales]);

  // Sort sales by date in descending order (most recent first)
  const sortedSales = useMemo(() => {
    if (!filteredSales) return [];
    return [...filteredSales].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredSales]);

  const handleViewBill = (sale: Sale) => {
    setSelectedSale(sale);
    setIsPrintModalOpen(true);
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setSelectedSale(null);
  };

  // Get unique companies from a sale
  const getUniqueCompanies = (sale: Sale) => {
    const companies = new Set(sale.items.map(item => item.companyName));
    return Array.from(companies);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedSales.map((sale) => {
          const uniqueCompanies = getUniqueCompanies(sale);
          const hasMultipleCompanies = uniqueCompanies.length > 1;

          return (
            <Card key={sale.id} className="p-4">
              <div className="flex flex-col space-y-3">
                {/* Header with Bill Number and Date */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">Bill #{sale.billNumber}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(sale.date), 'dd MMM yyyy, hh:mm a')}
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded text-xs font-medium" 
                    style={{
                      backgroundColor: sale.billType === 'GST' ? '#e0f2fe' : '#f3e8ff',
                      color: sale.billType === 'GST' ? '#0369a1' : '#6b21a8'
                    }}>
                    {sale.billType}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="text-sm">
                  <p className="font-medium">Customer: {sale.customerName}</p>
                  {sale.customerMobile && (
                    <p className="text-gray-500">Mobile: {sale.customerMobile}</p>
                  )}
                </div>

                {/* Companies Info */}
                <div className="text-sm text-gray-600">
                  <p>Companies: {uniqueCompanies.join(', ')}</p>
                </div>

                {/* Items Summary */}
                <div className="text-sm">
                  <p className="text-gray-600">
                    Items: {sale.items.length} | 
                    Qty: {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                  <p className="font-medium text-green-600">
                    Total: ₹{sale.totalAmount.toFixed(2)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewBill(sale)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Bill
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewBill(sale)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* No Sales Message */}
      {!isLoading && sortedSales.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Sales Found</h3>
          <p className="text-gray-500">There are no sales records to display.</p>
        </div>
      )}

      {/* Print Bill Modal */}
      {isPrintModalOpen && selectedSale && (
        <PrintBillModal
          isOpen={isPrintModalOpen}
          onClose={handleClosePrintModal}
          sale={selectedSale}
          printType="all"
        />
      )}
    </div>
  );
};

export default SalesList;
