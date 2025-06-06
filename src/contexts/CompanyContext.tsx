
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Company, CompanyContextType } from '../types';
import { companies as mockCompanies } from '../data/mockData';
import { generateId } from '../data/mockData';
import { toast } from 'sonner';

// Define our default companies
const DEFAULT_COMPANIES: Omit<Company, 'id' | 'createdAt'>[] = [
  {
    name: 'Mansan Laal and Sons',
    address: '123 GST Road, Delhi',
    phone: '9876543210',
    email: 'contact@mansanlaal.com',
    gstNumber: '27AADCB2230M1Z3',
    panNumber: 'AADCB2230M',
    cinNumber: 'U74999DL2023PTC123456',
    tanNumber: 'DELM12345A',
    gstin: '27AADCB2230M1Z3'
  },
  {
    name: 'Estimate',
    address: '456 Non-GST Street, Mumbai',
    phone: '8765432109',
    email: 'info@estimate.com',
    gstNumber: '',
    panNumber: 'ABCDE1234F',
    cinNumber: '',
    tanNumber: '',
    gstin: ''
  }
];

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  // Initialize with default companies if none exist
  useEffect(() => {
    // Check if we already have companies from mockData or previous sessions
    if (mockCompanies.length > 0) {
      setCompanies(mockCompanies);
      setCurrentCompany(null); // Set to null initially to show all companies in dashboard
    } else {
      // If no companies exist, add our default companies
      const initializedCompanies: Company[] = DEFAULT_COMPANIES.map(company => ({
        ...company,
        id: generateId(),
        createdAt: new Date().toISOString()
      }));
      
      setCompanies(initializedCompanies);
      
      // Set to null initially to show all companies in dashboard
      setCurrentCompany(null);
    }
  }, []);

  const addCompany = (companyData: Omit<Company, 'id' | 'createdAt'>) => {
    const newCompany: Company = {
      ...companyData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    setCompanies((prev) => [...prev, newCompany]);
    toast.success('Company added successfully');
  };

  const updateCompany = (updatedCompany: Company) => {
    setCompanies((prev) =>
      prev.map((company) =>
        company.id === updatedCompany.id ? updatedCompany : company
      )
    );
    
    // Update current company if it's the one being updated
    if (currentCompany && currentCompany.id === updatedCompany.id) {
      setCurrentCompany(updatedCompany);
    }
    
    toast.success('Company updated successfully');
  };

  const deleteCompany = (id: string) => {
    setCompanies((prev) => prev.filter((company) => company.id !== id));
    
    // Reset current company if it's the one being deleted
    if (currentCompany && currentCompany.id === id) {
      setCurrentCompany(null);
    }
    
    toast.success('Company deleted successfully');
  };

  return (
    <CompanyContext.Provider
      value={{
        companies,
        currentCompany,
        setCurrentCompany,
        addCompany,
        updateCompany,
        deleteCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  
  return context;
};
