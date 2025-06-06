import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompany } from '../contexts/CompanyContext';
import { useSales } from '../contexts/SalesContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const Reports = () => {
  const { companies } = useCompany();
  const { sales } = useSales();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  
  // Filter sales based on selected company
  const filteredSales = selectedCompanyId === 'all' 
    ? sales 
    : sales.filter(sale => sale.companyId === selectedCompanyId);

  // Generate data for the sales chart
  const salesChartData = filteredSales.reduce((acc, sale) => {
    const date = new Date(sale.date);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    
    const existingDay = acc.find(day => day.date === dateStr);
    
    if (existingDay) {
      if (sale.billType === 'GST') {
        existingDay.gstSales += sale.totalAmount;
      } else {
        existingDay.nonGstSales += sale.totalAmount;
      }
      existingDay.total += sale.totalAmount;
    } else {
      acc.push({
        date: dateStr,
        gstSales: sale.billType === 'GST' ? sale.totalAmount : 0,
        nonGstSales: sale.billType === 'NON-GST' ? sale.totalAmount : 0,
        total: sale.totalAmount
      });
    }
    
    return acc;
  }, [] as { date: string; gstSales: number; nonGstSales: number; total: number }[]);

  // Sort by date
  salesChartData.sort((a, b) => {
    const dateA = new Date(`2025/${a.date}`);
    const dateB = new Date(`2025/${b.date}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Limit to last 7 days
  const recentSalesData = salesChartData.slice(-7);
  
  // GST vs Non-GST Pie Chart Data
  const gstTotal = filteredSales.filter(sale => sale.billType === 'GST')
    .reduce((sum, sale) => sum + sale.totalAmount, 0);
    
  const nonGstTotal = filteredSales.filter(sale => sale.billType === 'NON-GST')
    .reduce((sum, sale) => sum + sale.totalAmount, 0);
    
  const pieChartData = [
    { name: 'GST Sales', value: gstTotal },
    { name: 'Non-GST Sales', value: nonGstTotal }
  ];
  
  // Company Revenue Data
  const companyData = companies.map(company => {
    const companySales = sales.filter(sale => sale.companyId === company.id);
    return {
      name: company.name,
      revenue: companySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
      bills: companySales.length
    };
  });
  
  // Handle company filter change
  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          
          <div className="w-64">
            <Select 
              defaultValue="all"
              value={selectedCompanyId || 'all'}
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

        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sales">Sales Reports</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
            <TabsTrigger value="gst">GST Reports</TabsTrigger>
            <TabsTrigger value="company">Company Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentSalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="gstSales" name="GST Sales" fill="#3b82f6" />
                      <Bar dataKey="nonGstSales" name="Non-GST Sales" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>GST vs Non-GST Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => {
                          // Ensure value is a number before calling toFixed
                          return `₹${typeof value === 'number' ? value.toFixed(2) : value}`;
                        }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sales Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="border rounded-md p-4">
                      <div className="text-sm text-muted-foreground">Total Sales</div>
                      <div className="text-2xl font-bold">
                        ₹{filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {filteredSales.length} bills generated
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="text-sm text-muted-foreground">GST Sales</div>
                      <div className="text-2xl font-bold">
                        ₹{filteredSales
                          .filter(sale => sale.billType === 'GST')
                          .reduce((sum, sale) => sum + sale.totalAmount, 0)
                          .toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {filteredSales.filter(sale => sale.billType === 'GST').length} GST bills
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <div className="text-sm text-muted-foreground">Non-GST Sales</div>
                      <div className="text-2xl font-bold">
                        ₹{filteredSales
                          .filter(sale => sale.billType === 'NON-GST')
                          .reduce((sum, sale) => sum + sale.totalAmount, 0)
                          .toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {filteredSales.filter(sale => sale.billType === 'NON-GST').length} non-GST bills
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Revenue</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => {
                        // Ensure value is a number before calling toFixed
                        return `₹${typeof value === 'number' ? value.toFixed(2) : value}`;
                      }} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Company Sales Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {companyData.map((company) => (
                    <div key={company.name} className="border p-4 rounded-md">
                      <div className="font-medium">{company.name}</div>
                      <div className="text-2xl font-bold">₹{company.revenue.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">{company.bills} bills</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory" className="space-y-4">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                Inventory reports are available in Tally after synchronization:
                <br />
                Inventory Summary, Godown Reports, Stock Valuation, etc.
              </p>
            </Card>
          </TabsContent>
          
          <TabsContent value="gst" className="space-y-4">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                GST reports are available in Tally after synchronization:
                <br />
                GSTR-1, GSTR-2, GSTR-3B, GST Analysis, etc.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

const ReportsPage = () => <Reports />;

export default ReportsPage;
