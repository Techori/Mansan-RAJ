import React from 'react';
import CustomersList from '@/components/customers/CustomersList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const CustomersPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>
      
      <CustomersList />
    </div>
  );
};

export default CustomersPage; 