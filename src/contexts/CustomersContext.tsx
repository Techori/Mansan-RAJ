import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer } from '../types';
import { toast } from 'sonner';
import axios from '@/lib/axios';

interface GroupedLedgers {
  group: string;
  ledgers: string[];
}

interface CustomersContextType {
  groupedCustomers: GroupedLedgers[];
  addCustomer: (customer: Omit<Customer, 'createdAt'>) => Promise<Customer>;
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  filteredLedgers: string[];
  isLoading: boolean;
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined);

export const CustomersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [groupedCustomers, setGroupedCustomers] = useState<GroupedLedgers[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post('/api/tally/customers/fetch-ledgers');
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Transform the response data into GroupedLedgers format
      const transformedData = Object.entries(response.data).map(([_, value]: [string, any]) => ({
        group: value.group,
        ledgers: value.ledgers || []
      }));

      setGroupedCustomers(transformedData);
      
      // Set default selected group if none is selected
      if (!selectedGroup && transformedData.length > 0) {
        setSelectedGroup(transformedData[0].group);
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch customers';
      console.error('Error fetching customers:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get filtered ledgers based on selected group
  const filteredLedgers = React.useMemo(() => {
    if (!selectedGroup) return [];
    const group = groupedCustomers.find(g => g.group === selectedGroup);
    return group ? group.ledgers : [];
  }, [selectedGroup, groupedCustomers]);

  const addCustomer = async (customer: Omit<Customer, 'createdAt'>) => {
    try {
      console.log("customer in customer context", customer);
      
      const customerData = {
        ...customer,
        createdAt: new Date().toISOString()
      };

      const response = await axios.post('/api/tally/ledgers/create-ledger', customerData);
      await fetchCustomers(); // Refresh the list after adding
      toast.success('Customer added successfully');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to add customer';
      toast.error(errorMessage);
      throw err;
    }
  };

  return (
    <CustomersContext.Provider
      value={{
        groupedCustomers,
        addCustomer,
        selectedGroup,
        setSelectedGroup,
        filteredLedgers,
        isLoading
      }}
    >
      {children}
    </CustomersContext.Provider>
  );
};

export const useCustomers = (): CustomersContextType => {
  const context = useContext(CustomersContext);
  
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomersProvider');
  }
  
  return context;
};