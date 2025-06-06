import React, { useState, useEffect } from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { useInventory } from '../../contexts/InventoryContext';
import { useSales } from '../../contexts/SalesContext';
import { Item, SaleItem, Godown } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const calculateGST = (price: number, quantity: number, gstPercentage: number) => {
  return (price * quantity * gstPercentage) / 100;
};

const SaleEntryForm: React.FC = () => {
  const { currentCompany } = useCompany();
  // const { filteredItems, filteredGodowns } = useInventory();
  const { addSaleItem, currentSaleItems, removeSaleItem, createSale, clearSaleItems } = useSales();

  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [selectedGodownId, setSelectedGodownId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'GST' | 'NON-GST'>('GST');
  const [salesUnit, setSalesUnit] = useState<string>('Piece');

  // Group items by GST and Non-GST
  const gstItems = filteredItems.filter((item) => item.type === 'GST');
  const nonGstItems = filteredItems.filter((item) => item.type === 'NON-GST');

  // Group sale items by type
  const gstSaleItems = currentSaleItems.filter((item) => item.gstPercentage !== undefined);
  const nonGstSaleItems = currentSaleItems.filter((item) => item.gstPercentage === undefined);

  // Calculate totals
  const calculateTotals = (items: SaleItem[]) => {
    let subtotal = 0;
    let gstAmount = 0;
    let total = 0;

    items.forEach((item) => {
      subtotal += item.unitPrice * item.quantity;
      gstAmount += item.gstAmount || 0;
      total += item.totalPrice;
    });

    return { subtotal, gstAmount, total };
  };

  const gstTotals = calculateTotals(gstSaleItems);
  const nonGstTotals = calculateTotals(nonGstSaleItems);

  useEffect(() => {
    if (filteredGodowns.length > 0 && !selectedGodownId) {
      setSelectedGodownId(filteredGodowns[0].id);
    }
  }, [filteredGodowns, selectedGodownId]);

  useEffect(() => {
    if (selectedItemId) {
      const item = filteredItems.find((item) => item.id === selectedItemId);
      setSelectedItem(item || null);
    } else {
      setSelectedItem(null);
    }
  }, [selectedItemId, filteredItems]);

  const handleAddItem = () => {
    if (!selectedItem) {
      toast.error('Please select an item');
      return;
    }

    if (!currentCompany) {
      toast.error('No company selected');
      return;
    }

    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (quantity > selectedItem.stockQuantity) {
      toast.error(`Only ${selectedItem.stockQuantity} units available in stock`);
      return;
    }

    let gstAmount = 0;
    let totalPrice = selectedItem.unitPrice * quantity;

    if (selectedItem.type === 'GST' && selectedItem.gstPercentage) {
      gstAmount = calculateGST(
        selectedItem.unitPrice,
        quantity,
        selectedItem.gstPercentage
      );
      totalPrice += gstAmount;
    }

    const saleItem: SaleItem = {
      itemId: selectedItem.id,
      companyId: currentCompany.id,
      companyName: currentCompany.name,
      name: selectedItem.name,
      quantity,
      unitPrice: selectedItem.unitPrice,
      gstPercentage: selectedItem.type === 'GST' ? selectedItem.gstPercentage : undefined,
      gstAmount: selectedItem.type === 'GST' ? gstAmount : undefined,
      totalPrice,
      totalAmount: totalPrice,
      salesUnit: salesUnit,
    };

    addSaleItem(saleItem);
    setSelectedItemId('');
    setQuantity(1);
  };

  const handleCreateSale = () => {
    if (!currentCompany) {
      toast.error('No company selected');
      return;
    }

    if (customerName.trim() === '') {
      toast.error('Please enter customer name');
      return;
    }

    if (gstSaleItems.length > 0 && nonGstSaleItems.length > 0) {
      // Create separate bills for GST and Non-GST items
      if (gstSaleItems.length > 0) {
        createSale({
          companyId: currentCompany.id,
          billNumber: `GST-${Date.now()}`,
          date: new Date().toISOString(),
          customerName,
          billType: 'GST',
          godownId: selectedGodownId,
          totalAmount: gstTotals.total,
          items: gstSaleItems
        });
      }

      if (nonGstSaleItems.length > 0) {
        createSale({
          companyId: currentCompany.id,
          billNumber: `NON-${Date.now()}`,
          date: new Date().toISOString(),
          customerName,
          billType: 'NON-GST',
          godownId: selectedGodownId,
          totalAmount: nonGstTotals.total,
          items: nonGstSaleItems
        });
      }
    } else if (gstSaleItems.length > 0) {
      createSale({
        companyId: currentCompany.id,
        billNumber: `GST-${Date.now()}`,
        date: new Date().toISOString(),
        customerName,
        billType: 'GST',
        godownId: selectedGodownId,
        totalAmount: gstTotals.total,
        items: gstSaleItems
      });
    } else if (nonGstSaleItems.length > 0) {
      createSale({
        companyId: currentCompany.id,
        billNumber: `NON-${Date.now()}`,
        date: new Date().toISOString(),
        customerName,
        billType: 'NON-GST',
        godownId: selectedGodownId,
        totalAmount: nonGstTotals.total,
        items: nonGstSaleItems
      });
    } else {
      toast.error('No items added to the sale');
      return;
    }

    // Reset form
    setCustomerName('');
  };

  if (!currentCompany) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-500">Please select a company first</p>
      </Card>
    );
  }

  const displayItems = activeTab === 'GST' ? gstItems : nonGstItems;

  return (
    <div className="space-y-6">
      {/* Customer Info Only (remove Godown from here) */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>
        </div>
      </Card>
      
      {/* Item Selection Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'GST' | 'NON-GST')}>
              <div className="p-4 border-b">
                <TabsList className="w-full">
                  <TabsTrigger value="GST" className="flex-1">GST Items</TabsTrigger>
                  <TabsTrigger value="NON-GST" className="flex-1">Non-GST Items</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="col-span-1 md:col-span-2">
                    <Label htmlFor="item">Select Item</Label>
                    <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an item" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - ₹{item.unitPrice} {item.type === 'GST' && `(GST: ${item.gstPercentage}%)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <div className="flex">
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddItem}
                        className="ml-2"
                      >
                        <Plus size={16} className="mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="godown">Godown *</Label>
                    <Select 
                      value={selectedGodownId} 
                      onValueChange={setSelectedGodownId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select godown" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredGodowns.map((godown) => (
                          <SelectItem key={godown.id} value={godown.id}>
                            {godown.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mb-4">
                  {selectedItem && (
                    <div className="text-xs text-gray-600">
                      <p>In stock: {selectedItem.stockQuantity} units</p>
                      <p>Unit price: ₹{selectedItem.unitPrice.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {/* Current Items Table */}
                <div className="border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-left">Qty</th>
                        <th className="p-2 text-left">Unit Price</th>
                        {activeTab === 'GST' && <th className="p-2 text-left">GST %</th>}
                        {activeTab === 'GST' && <th className="p-2 text-left">GST Amt</th>}
                        <th className="p-2 text-left">Total</th>
                        <th className="p-2 text-left"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeTab === 'GST' 
                        ? gstSaleItems.map((item, index) => (
                          <tr key={`gst-${index}`} className="border-t">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">₹{item.unitPrice.toFixed(2)}</td>
                            <td className="p-2">{item.gstPercentage}%</td>
                            <td className="p-2">₹{(item.gstAmount || 0).toFixed(2)}</td>
                            <td className="p-2 font-medium">₹{item.totalPrice.toFixed(2)}</td>
                            <td className="p-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeSaleItem(currentSaleItems.indexOf(item))}
                                className="text-red-500 h-7 w-7"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))
                        : nonGstSaleItems.map((item, index) => (
                          <tr key={`non-gst-${index}`} className="border-t">
                            <td className="p-2">{item.name}</td>
                            <td className="p-2">{item.quantity}</td>
                            <td className="p-2">₹{item.unitPrice.toFixed(2)}</td>
                            <td className="p-2 font-medium">₹{item.totalPrice.toFixed(2)}</td>
                            <td className="p-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeSaleItem(currentSaleItems.indexOf(item))}
                                className="text-red-500 h-7 w-7"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))
                      }
                      {(activeTab === 'GST' && gstSaleItems.length === 0) || 
                       (activeTab === 'NON-GST' && nonGstSaleItems.length === 0) ? (
                        <tr>
                          <td 
                            colSpan={activeTab === 'GST' ? 7 : 5} 
                            className="p-4 text-center text-gray-500"
                          >
                            No items added yet
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tabs>
          </Card>
        </div>
        
        {/* Summary and Actions */}
        <div>
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Bill Summary</h3>
            
            {gstSaleItems.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-600 mb-2">GST Bill</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{gstTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST:</span>
                    <span>₹{gstTotals.gstAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>₹{gstTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {nonGstSaleItems.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-600 mb-2">Non-GST Bill</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>₹{nonGstTotals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {(gstSaleItems.length > 0 || nonGstSaleItems.length > 0) && (
              <div className="pt-4 border-t mt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Grand Total:</span>
                  <span>₹{(gstTotals.total + nonGstTotals.total).toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <div className="mt-6 space-y-2">
              <Button 
                className="w-full"
                size="lg"
                disabled={currentSaleItems.length === 0 || !customerName}
                onClick={handleCreateSale}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Create Bill
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={clearSaleItems}
                disabled={currentSaleItems.length === 0}
              >
                Clear All
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SaleEntryForm;
