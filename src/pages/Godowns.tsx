/**
 * Godowns Page
 * Manages warehouse/godown locations with functionality to add, edit,
 * and delete storage facilities for inventory management.
 */

import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import GodownList from '../components/godowns/GodownList';
import GodownForm from '../components/godowns/GodownForm';
import { Godown } from '../types';
import { useInventory } from '../contexts/InventoryContext';
import { PlusCircle } from 'lucide-react';

const Godowns = () => {
  const [isAddingGodown, setIsAddingGodown] = useState(false);
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null);
  const { addGodown, updateGodown, deleteGodown } = useInventory();

  const handleAddGodown = () => {
    setIsAddingGodown(true);
    setEditingGodown(null);
  };

  const handleEditGodown = (godown: Godown) => {
    setEditingGodown(godown);
    setIsAddingGodown(false);
  };

  const handleSubmit = (formData: Omit<Godown, 'id' | 'createdAt'>) => {
    if (editingGodown) {
      updateGodown({
        ...editingGodown,
        ...formData,
      });
    } else {
      addGodown(formData);
    }
    setIsAddingGodown(false);
    setEditingGodown(null);
  };

  const handleCancel = () => {
    setIsAddingGodown(false);
    setEditingGodown(null);
  };

  const handleDeleteGodown = (id: string) => {
    if (window.confirm('Are you sure you want to delete this godown?')) {
      deleteGodown(id);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Godowns</h2>
          <Button onClick={handleAddGodown} disabled={isAddingGodown || !!editingGodown}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Godown
          </Button>
        </div>

        {isAddingGodown && (
          <GodownForm onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

        {editingGodown && (
          <GodownForm godown={editingGodown} onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

        <GodownList onEdit={handleEditGodown} onDelete={handleDeleteGodown} />
      </div>
    </MainLayout>
  );
};

const GodownsPage = () => <Godowns />;

export default GodownsPage;
