
import React from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const LowStockItems: React.FC = () => {
  // // const { filteredItems, filteredGodowns } = useInventory();
  
  // // Get items with low stock (10 or fewer)
  // const lowStockItems = filteredItems
  //   .filter(item => item.stockQuantity <= 10)
  //   .sort((a, b) => a.stockQuantity - b.stockQuantity)
  //   .slice(0, 5);
  
  // const godownNameMap = filteredGodowns.reduce((acc, godown) => {
  //   acc[godown.id] = godown.name;
  //   return acc;
  // }, {} as Record<string, string>);
  
  return (
    <h1></h1>
  //   <Card>
  //     <CardHeader>
  //       <CardTitle className="text-lg font-semibold">Low Stock Items</CardTitle>
  //     </CardHeader>
  //     <CardContent>
  //       {lowStockItems.length === 0 ? (
  //         <div className="text-center py-6 text-gray-500">
  //           No low stock items found
  //         </div>
  //       ) : (
  //         <div className="space-y-4">
  //           {lowStockItems.map((item) => (
  //             <div key={item.id} className="flex items-start">
  //               <div className="rounded-full bg-red-100 p-2 mr-4">
  //                 <AlertTriangle className="h-4 w-4 text-red-600" />
  //               </div>
  //               <div className="flex-1">
  //                 <div className="flex items-center justify-between">
  //                   <div className="font-medium">{item.name}</div>
  //                   <div className="text-sm font-semibold text-red-600">
  //                     {item.stockQuantity} left
  //                   </div>
  //                 </div>
  //                 <div className="flex items-center justify-between mt-1">
  //                   <div className="text-sm text-muted-foreground">
  //                     {godownNameMap[item.godownId] || 'Unknown Godown'} • {item.type}
  //                   </div>
  //                   <div className="text-sm">₹{item.unitPrice}</div>
  //                 </div>
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       )}
  //     </CardContent>
  //   </Card>
  );
};

export default LowStockItems;
