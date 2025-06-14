import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from '../../contexts/CustomersContext';
import { Customer } from '../../types';
import { toast } from 'sonner';
import { useCompany } from '../../contexts/CompanyContext';

interface CreateCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: Customer) => void;
}

const CreateCustomerDialog: React.FC<CreateCustomerDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addCustomer, groupedCustomers } = useCustomers();
  const { currentCompany } = useCompany();
  const [formData, setFormData] = React.useState({
    companyId: currentCompany?.id || '',
    name: '',
    groupName: '',
    stateName: '',
    pincode: '',
    email: '',
    gstNumber: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
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
  }, [isOpen, currentCompany]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.groupName || !formData.gstNumber || !formData.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const customer = await addCustomer(formData);
      toast.success('Customer created successfully');
      onSuccess(customer);
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      // Error is already handled in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Customer Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="groupName">Group Name *</Label>
                <Select
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stateName">State Name</Label>
                <Input
                  id="stateName"
                  name="stateName"
                  value={formData.stateName}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="gstNumber">GST Number *</Label>
              <Input
                id="gstNumber"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div>
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerDialog; 