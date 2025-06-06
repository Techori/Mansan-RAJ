
import React from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Godown } from '../../types';
import { Edit, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GodownListProps {
  onEdit: (godown: Godown) => void;
  onDelete: (godownId: string) => void;
}

const GodownList: React.FC<GodownListProps> = ({ onEdit, onDelete }) => {
  const { filteredGodowns, filteredItems } = useInventory();

  // Count items per godown
  const itemCountByGodown = filteredItems.reduce((acc, item) => {
    acc[item.godownId] = (acc[item.godownId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (filteredGodowns.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No godowns found. Please add a godown to get started.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredGodowns.map((godown) => (
        <Card key={godown.id} className="overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-blue-100 mr-3">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg">{godown.name}</h3>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              {godown.address && (
                <p className="text-gray-500">{godown.address}</p>
              )}
              
              <div className="flex items-center text-gray-700">
                <span className="font-medium">Items:</span>
                <span className="ml-2">{itemCountByGodown[godown.id] || 0}</span>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(godown)}
                className="text-blue-500"
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(godown.id)}
                className="text-red-500 border-red-200 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default GodownList;
