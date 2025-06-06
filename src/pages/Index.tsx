import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import DashboardSummary from '../components/dashboard/DashboardSummary';
import RecentSales from '../components/dashboard/RecentSales';
import LowStockItems from '../components/dashboard/LowStockItems';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, RotateCcw } from 'lucide-react';
import ReturnItemForm from '../components/inventory/ReturnItemForm';

const Index = () => {
  const [showReturnForm, setShowReturnForm] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex space-x-2">
            <Link to="/sales/new">
              <Button>
                <ShoppingCart className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </Link>
            <Link to="/inventory">
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </Link>
            <Button 
              variant="secondary" 
              onClick={() => setShowReturnForm(true)}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Return Item
            </Button>
          </div>
        </div>
        
        {showReturnForm ? (
          <ReturnItemForm onCancel={() => setShowReturnForm(false)} />
        ) : (
          <>
            <DashboardSummary />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentSales />
              <LowStockItems />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

const IndexPage = () => <Index />;

export default IndexPage;
