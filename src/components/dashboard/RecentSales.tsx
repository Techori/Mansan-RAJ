
import React from 'react';
import { useSales } from '../../contexts/SalesContext';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

const RecentSales: React.FC = () => {
  const { filteredSales } = useSales();
  
  // Get the 5 most recent sales
  const recentSales = [...filteredSales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        {recentSales.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No recent sales found
          </div>
        ) : (
          <div className="space-y-4">
            {recentSales.map((sale) => (
              <div key={sale.id} className="flex items-start">
                <div className="rounded-full bg-gray-100 p-2 mr-4">
                  <ShoppingCart className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{sale.billNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(sale.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-muted-foreground">
                      {sale.customerName} • {sale.billType} Bill
                    </div>
                    <div className="font-medium">₹{sale.totalAmount.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;
