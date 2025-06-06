/**
 * Sales Page
 * Manages sales transactions with functionality to create new sales,
 * view sales history, and analyze sales data through different tabs.
 */

import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import SalesList from '../components/sales/SalesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, List } from 'lucide-react';

const Sales = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Sales</h2>
          <Button onClick={() => navigate('/sales/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Button>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list" onClick={() => setActiveTab('list')}>
              <List className="h-4 w-4 mr-2" />
              Sales List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <SalesList />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Sales;
