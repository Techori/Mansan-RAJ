import React, { useMemo, useState } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useSales } from '../../contexts/SalesContext';
import { useInventory } from '../../contexts/InventoryContext';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Package, ArrowUp, ArrowDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const DashboardSummary: React.FC = () => {
  const { companies } = useCompany();
  const { sales } = useSales();
  const { items } = useInventory();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');

  const stats = useMemo(() => {
    const filteredSales = selectedCompanyId === 'all' 
      ? sales 
      : sales.filter(sale => sale.companyId === selectedCompanyId);

    // Get today's date range
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    // Get yesterday's date range
    const yesterdayStart = startOfDay(subDays(new Date(), 1));
    const yesterdayEnd = endOfDay(subDays(new Date(), 1));

    // Filter sales for today and yesterday
    const todaySales = filteredSales.filter(sale => 
      isWithinInterval(new Date(sale.date), { start: todayStart, end: todayEnd })
    );

    const yesterdaySales = filteredSales.filter(sale => 
      isWithinInterval(new Date(sale.date), { start: yesterdayStart, end: yesterdayEnd })
    );

    // Calculate revenues
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const yesterdayRevenue = yesterdaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Calculate revenue change percentage
    const revenueChangePercent = yesterdayRevenue === 0 
      ? 100 
      : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    // GST and Non-GST calculations for today
    const todayGstSales = todaySales.filter(sale => sale.billType === 'GST');
    const todayNonGstSales = todaySales.filter(sale => sale.billType === 'NON-GST');

    const todayGstRevenue = todayGstSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const todayNonGstRevenue = todayNonGstSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    // Total GST and Non-GST calculations
    const gstSales = filteredSales.filter(sale => sale.billType === 'GST');
    const nonGstSales = filteredSales.filter(sale => sale.billType === 'NON-GST');

    const gstRevenue = gstSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const nonGstRevenue = nonGstSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    
    const totalDiscount = todaySales.reduce((sum, sale) => 
      sum + (sale.totalDiscount || 0), 0);

    const companyRevenue = companies.map(company => {
      const companySales = todaySales.filter(sale => sale.companyId === company.id);
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
      yesterdayRevenue,
      revenueChangePercent,
      todayGstRevenue,
      todayNonGstRevenue,
      gstRevenue,
      nonGstRevenue,
      totalItemsCount: filteredItems.length,
      lowStockCount: lowStockItems.length,
      totalDiscount,
      todayBillCount: todaySales.length,
      yesterdayBillCount: yesterdaySales.length,
      todayGstBillCount: todayGstSales.length,
      todayNonGstBillCount: todayNonGstSales.length,
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
          <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
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
                <p className="text-sm font-medium text-muted-foreground">Today's Sales</p>
                <h3 className="text-2xl font-bold">₹{stats.todayRevenue.toFixed(2)}</h3>
                <p className={`text-xs ${stats.revenueChangePercent >= 0 ? 'text-green-600' : 'text-red-600'} mt-1 flex items-center`}>
                  {stats.revenueChangePercent >= 0 ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{Math.abs(stats.revenueChangePercent).toFixed(1)}% from yesterday</span>
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
                <p className="text-sm font-medium text-muted-foreground">Today's GST Sales</p>
                <h3 className="text-2xl font-bold">₹{stats.todayGstRevenue.toFixed(2)}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span>Bills: {stats.todayGstBillCount}</span>
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
                <p className="text-sm font-medium text-muted-foreground">Today's Non-GST Sales</p>
                <h3 className="text-2xl font-bold">₹{stats.todayNonGstRevenue.toFixed(2)}</h3>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                  <span>Bills: {stats.todayNonGstBillCount}</span>
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
            <h3 className="text-lg font-semibold mb-4">Today's Company Revenue</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.companyRevenue.map((company) => (
                <Card key={company.id} className="border p-4">
                  <p className="font-semibold">{company.name}</p>
                  <h4 className="text-xl mt-1">₹{company.revenue.toFixed(2)}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{company.billCount} bills today</p>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-4">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Today's Sales Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Total Sales Today</div>
                <div className="text-2xl font-bold">
                  ₹{(stats.todayGstRevenue + stats.todayNonGstRevenue).toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.todayBillCount} bills generated today
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Today's Discount</div>
                <div className="text-2xl font-bold">
                  ₹{stats.totalDiscount.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Applied on today's bills
                </div>
              </div>
              
              <div className="border rounded-md p-4">
                <div className="text-sm text-muted-foreground">Today's GST vs Non-GST</div>
                <div className="text-2xl font-bold">
                  {stats.todayGstRevenue > 0 || stats.todayNonGstRevenue > 0 ? 
                    `${Math.round((stats.todayGstRevenue / (stats.todayGstRevenue + stats.todayNonGstRevenue)) * 100)}% / ${Math.round((stats.todayNonGstRevenue / (stats.todayGstRevenue + stats.todayNonGstRevenue)) * 100)}%` :
                    '0% / 0%'
                  }
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Today's GST to Non-GST ratio
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
