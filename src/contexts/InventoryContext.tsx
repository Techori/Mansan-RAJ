import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Item } from '../types';
import { toast } from 'sonner';
import axios from '@/lib/axios';

interface InventoryContextType {
  items: Item[];
  getAllItems: () => Item[];
  isLoading: boolean;
  error: string | null;
  fetchItems: (forceApi?: boolean) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const mapItems = (items: any) => {

    const mappedItems: Item[] = items.map((item: any, index: number) => ({
      name: item.item_name,
      stockQuantity: item.stock_quantity || 0,
      unitPrice: parseFloat(item.standard_price) || 0,
      hsn: item.hsn_code,
      gstPercentage: item.gst_details?.igst_rate ? parseFloat(item.gst_details.igst_rate) : 0,
      mrp: item.mrp_rate,
      godown: item.godowns || [],
      company: item.company_name || '',
      companyId: item.companyId || '',
      salesUnit: item.salesUnit || 'Piece',
      createdAt: item.createdAt || new Date().toISOString(),
      rateAfterGst: 0,
      priceList: item.price_level_list || [],
      allUnits : item.base_units || "pcs"
    }));



    setItems(mappedItems);
  }

  const fetchItems = async (forceApi = false) => {
    if (!forceApi && localStorage.getItem('items')) {
      const parsedItems = JSON.parse(localStorage.getItem('items') || '[]');
      setItems(parsedItems);
      setIsLoading(false);
      mapItems(parsedItems);
    } else {
      try {
        setIsLoading(true);
        setError(null);
        const result = await axios.post('/api/tally/stocks/fetch-items');
        localStorage.setItem('items', JSON.stringify(result.data));
        mapItems(result.data);
        if (!result.data) {
          throw new Error('No data received from server');
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch inventory items';
        console.error('Error fetching items:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };


    const getAllItems = (): Item[] => {
      return items;
    };


    useEffect(() => {
      fetchItems();
    }, []);


    return (
      <InventoryContext.Provider
        value={{
          items,
          getAllItems,
          isLoading,
          error,
          fetchItems
        }}
      >
        {children}
      </InventoryContext.Provider>
    );
  }





  export const useInventory = (): InventoryContextType => {
    const context = useContext(InventoryContext);

    if (context === undefined) {
      throw new Error('useInventory must be used within an InventoryProvider');
    }

    return context;
  };
