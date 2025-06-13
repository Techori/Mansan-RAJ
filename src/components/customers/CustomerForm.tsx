import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import { useCustomers } from '../../contexts/CustomersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (formData: Customer) => void;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSubmit, onCancel }) => {
  const { currentCompany } = useCompany();
  const { addCustomer, updateCustomer } = useCustomers();

  const [formData, setFormData] = useState<any>({
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
      const { id, createdAt, ...rest } = customer;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer) {
      updateCustomer({ ...customer, ...formData });
    } else {
      addCustomer({ ...formData, companyId: formData.companyId || '' });
    }
    onSubmit({ ...formData, id: customer?.id || '', createdAt: customer?.createdAt || new Date().toISOString() });
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
              <Input
                id="groupName"
                name="groupName"
                value={formData.groupName}
                onChange={handleChange}
                required
              />
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {customer ? 'Update Customer' : 'Add Customer'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CustomerForm;

