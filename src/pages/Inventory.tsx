import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import ItemList from '../components/inventory/ItemList';
import ItemForm from '../components/inventory/ItemForm';
import { Item } from '../types';
import { useInventory } from '../contexts/InventoryContext';
import { PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompany } from '../contexts/CompanyContext';
import { toast } from 'sonner';

const Inventory = () => {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const { items } = useInventory();
  const { companies, currentCompany, setCurrentCompany } = useCompany();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(currentCompany?.id || '');

  const handleAddItem = () => {
    setIsAddingItem(true);
    setEditingItem(null);
    toast.info('Adding new items is currently disabled in this version.');
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setIsAddingItem(false);
    toast.info('Editing items is currently disabled in this version.');
  };

  const handleSubmit = (formData: Omit<Item, 'id' | 'createdAt'>) => {
    toast.info('Item management is currently disabled in this version.');
    setIsAddingItem(false);
    setEditingItem(null);
  };

  const handleCancel = () => {
    setIsAddingItem(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id: string) => {
    toast.info('Deleting items is currently disabled in this version.');
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);
    
    if (companyId === 'all') {
      setCurrentCompany(null);
    } else {
      const company = companies.find(c => c.id === companyId);
      if (company) {
        setCurrentCompany(company);
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64">
              <Select 
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
            
            <Button 
              onClick={handleAddItem} 
              disabled={isAddingItem || !!editingItem}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        {isAddingItem && (
          <ItemForm 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
            companyId={selectedCompanyId !== 'all' ? selectedCompanyId : undefined}
          />
        )}

        {editingItem && (
          <ItemForm 
            item={editingItem} 
            onSubmit={handleSubmit} 
            onCancel={handleCancel}
          />
        )}

        <ItemList 
          onEdit={handleEditItem} 
          onDelete={handleDeleteItem} 
          companyId={selectedCompanyId !== 'all' ? selectedCompanyId : undefined}
        />
      </div>
    </MainLayout>
  );
};

const InventoryPage = () => <Inventory />;

export default InventoryPage;
