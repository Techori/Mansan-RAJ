
import React, { useState, useEffect } from 'react';
import { Godown } from '../../types';
import { useCompany } from '../../contexts/CompanyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

interface GodownFormProps {
  godown?: Godown;
  onSubmit: (formData: Omit<Godown, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const GodownForm: React.FC<GodownFormProps> = ({
  godown,
  onSubmit,
  onCancel,
}) => {
  const { currentCompany } = useCompany();

  const [formData, setFormData] = useState<Omit<Godown, 'id' | 'createdAt'>>({
    companyId: currentCompany?.id || '',
    name: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (godown) {
      const { id, createdAt, ...rest } = godown;
      setFormData(rest);
    } else if (currentCompany) {
      setFormData({
        companyId: currentCompany.id,
        name: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
      });
    }
  }, [godown, currentCompany]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;
    
    onSubmit(formData);
  };

  if (!currentCompany) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">Please select a company first</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{godown ? 'Edit Godown' : 'Add New Godown'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Godown Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                value={formData.contactPerson || ''}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email || ''}
              onChange={handleChange}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {godown ? 'Update Godown' : 'Add Godown'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default GodownForm;
