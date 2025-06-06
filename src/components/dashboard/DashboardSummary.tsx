
import React, { useMemo, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useSales } from '../../contexts/SalesContext';
import { useInventory } from '../../contexts/InventoryContext';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Package, ArrowUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DashboardSummary: React.FC = () => {
  const { companies } = useCompany();
  const { sales } = useSales();
  const { items } = useInventory();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  const stats = useMemo(() => {
    const filteredSales = selectedCompanyId === 'all' 
      ? sales 
      : sales.filter(sale => sale.companyId === selectedCompanyId);
    
    const todaySales = filteredSales.filter(
      (sale) => new Date(sale.date).toDateString() === new Date().toDateString()
    );

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const gstSales = filteredSales.filter(
      (sale) => sale.billType === 'GST'
    );
    const gstRevenue = gstSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    const nonGstSales = filteredSales.filter(
      (sale) => sale.billType === 'NON-GST'
    );
    const nonGstRevenue = nonGstSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const totalDiscount = filteredSales.reduce((sum, sale) => 
      sum + (sale.totalDiscount || 0), 0);

    const companyRevenue = companies.map(company => {
      const companySales = sales.filter(sale => sale.companyId === company.id);
      return {
        id: company.id,
        name: company.name,
        revenue: companySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        billCount: companySales.length
      };
    });
    
    // Get filterable items based on company selection
    const filteredItems = selectedCompanyId === 'all' 
      ? items 
      : items.filter(item => item.companyId === selectedCompanyId);

    const lowStockItems = filteredItems.filter((item) => item.stockQuantity <= 10);

    return {
      todayRevenue,
      gstRevenue,
      nonGstRevenue,
      totalItemsCount: filteredItems.length,
      lowStockCount: lowStockItems.length,
      totalDiscount,
      billCount: filteredSales.length,
      companyRevenue
    };
  }, [sales, items, companies, selectedCompanyId]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  return (
    <>
      <div className="flex justify-end mb-6">
        <div className="w-64">
          <Select 
            value={selectedCompanyId} 
            onValueChange={handleCompanyChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales (Today)</p>
                <h3 className="text-2xl font-bold">₹{stats.todayRevenue.toFixed(2)}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>+20.1% from yesterday</span>
                </p>
              </div>
              <div className="p-2 bg-gray-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">GST Sales</p>
                <h3 className="text-2xl font-bold">₹{stats.gstRevenue.toFixed(2)}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>Bills: {stats.billCount}</span>
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Non-GST Sales</p>
                <h3 className="text-2xl font-bold">₹{stats.nonGstRevenue.toFixed(2)}</h3>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  <span>Bills: {stats.billCount}</span>
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <h3 className="text-2xl font-bold">{stats.totalItemsCount}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.lowStockCount} items low in stock
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-4">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Company Revenue Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.companyRevenue.map((company) => (
                <Card key={company.id} className="border p-4">
                  <p className="font-semibold">{company.name}</p>
                  <h4 className="text-xl mt-1">₹{company.revenue.toFixed(2)}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{company.billCount} bills</p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-4">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Total Sales</div>
                <div className="text-2xl font-bold">
                  ₹{(stats.gstRevenue + stats.nonGstRevenue).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.billCount} bills generated
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Total Discount</div>
                <div className="text-2xl font-bold">
                  ₹{stats.totalDiscount.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Applied across all bills
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">GST vs Non-GST</div>
                <div className="text-2xl font-bold">
                  {stats.gstRevenue > 0 || stats.nonGstRevenue > 0 ? 
                    `${Math.round((stats.gstRevenue / (stats.gstRevenue + stats.nonGstRevenue)) * 100)}% / ${Math.round((stats.nonGstRevenue / (stats.gstRevenue + stats.nonGstRevenue)) * 100)}%` :
                    '0% / 0%'
                  }
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  GST to Non-GST ratio
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default DashboardSummary;
