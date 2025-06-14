import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import { useCustomers } from '../../contexts/CustomersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (formData: Customer) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const { currentCompany } = useCompany();
  const { addCustomer, groupedCustomers } = useCustomers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<Customer, 'createdAt'>>({
    companyId: currentCompany?.id || '',
    name: '',
    groupName: '',
    stateName: '',
    pincode: '',
    email: '',
    gstNumber: '',
    address: '',
  });

  useEffect(() => {
    if (customer) {
      const { createdAt, ...rest } = customer;
      setFormData({
        groupName: '',
        stateName: '',
        pincode: '',
        ...rest
      });
    } else {
      setFormData({
        companyId: currentCompany?.id || '',
        name: '',
        groupName: '',
        stateName: '',
        pincode: '',
        email: '',
        gstNumber: '',
        address: '',
      });
    }
  }, [customer, currentCompany]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (customer) {
        // Handle update logic here if needed
        const updatedCustomer: Customer = {
          ...customer,
          ...formData,
          createdAt: customer.createdAt
        };
        onSubmit(updatedCustomer);
      } else {
        // Create new customer
        console.log("customer in customer form", formData);
        const createdCustomer = await addCustomer(formData);
        onSubmit(createdCustomer);
      }
    } catch (error) {
      console.error('Error submitting customer:', error);
      toast.error('Failed to submit customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{customer ? 'Edit Customer' : 'Add New Customer'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit} onKeyDown={e => {
        if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type !== 'submit') {
          e.preventDefault();
        }
      }}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name *</Label>
              <Select
                name="groupName"
                value={formData.groupName}
                onValueChange={(value) => setFormData(prev => ({ ...prev, groupName: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {[...new Set(groupedCustomers.map(g => g.group))].map((groupName) => (
                    <SelectItem key={groupName} value={groupName}>
                      {groupName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stateName">State Name</Label>
              <Input
                id="stateName"
                name="stateName"
                value={formData.stateName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number *</Label>
              <Input
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : customer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CustomerForm;

