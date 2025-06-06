
/**
 * Companies Page
 * Manages company records with functionality to add, edit, and delete
 * company information within the system.
 */

import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { CompanyProvider } from '../contexts/CompanyContext';
import CompanyList from '../components/companies/CompanyList';
import CompanyForm from '../components/companies/CompanyForm';
import { Company } from '../types';
import { useCompany } from '../contexts/CompanyContext';
import { PlusCircle } from 'lucide-react';

const Companies = () => {
  const [isAddingCompany, setIsAddingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { addCompany, updateCompany, deleteCompany } = useCompany();

  const handleAddCompany = () => {
    setIsAddingCompany(true);
    setEditingCompany(null);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setIsAddingCompany(false);
  };

  const handleSubmit = (formData: Omit<Company, 'id' | 'createdAt'>) => {
    if (editingCompany) {
      updateCompany({
        ...editingCompany,
        ...formData,
      });
    } else {
      addCompany(formData);
    }
    setIsAddingCompany(false);
    setEditingCompany(null);
  };

  const handleCancel = () => {
    setIsAddingCompany(false);
    setEditingCompany(null);
  };

  const handleDeleteCompany = (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      deleteCompany(id);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
          <Button onClick={handleAddCompany} disabled={isAddingCompany || !!editingCompany}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </div>

        {isAddingCompany && (
          <CompanyForm onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

        {editingCompany && (
          <CompanyForm company={editingCompany} onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

        <CompanyList onEdit={handleEditCompany} onDelete={handleDeleteCompany} />
      </div>
    </MainLayout>
  );
};

const CompaniesPage = () => (
  <CompanyProvider>
    <Companies />
  </CompanyProvider>
);

export default CompaniesPage;
