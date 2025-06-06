/**
 * Customers Page
 * Manages customer information with functionality to view, add, edit,
 * and manage customer records within the system.
 */

import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomersList from '../components/customers/CustomersList';
import CustomerForm from '../components/customers/CustomerForm';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Customer } from '../types';

const Customers = () => {
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const handleAddCustomer = () => {
    setIsAddingCustomer(true);
    setEditingCustomer(null);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsAddingCustomer(false);
  };

  const handleSubmit = (formData: Customer) => {
    setIsAddingCustomer(false);
    setEditingCustomer(null);
  };

  const handleCancel = () => {
    setIsAddingCustomer(false);
    setEditingCustomer(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <Button onClick={handleAddCustomer}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {isAddingCustomer && (
          <CustomerForm onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

        {editingCustomer && (
          <CustomerForm customer={editingCustomer} onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

        <CustomersList onEdit={handleEditCustomer} />
      </div>
    </MainLayout>
  );
};

export default Customers;
