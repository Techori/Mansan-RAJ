
import React from 'react';
import { useCompany } from '../../contexts/CompanyContext';
import { Company } from '../../types';
import { Edit, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CompanyListProps {
  onEdit: (company: Company) => void;
  onDelete: (companyId: string) => void;
}

const CompanyList: React.FC<CompanyListProps> = ({ onEdit, onDelete }) => {
  const { companies, currentCompany, setCurrentCompany } = useCompany();

  const handleSetActive = (company: Company) => {
    setCurrentCompany(company);
  };

  if (companies.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No companies found. Please add a company to get started.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th className="px-6 py-3">Company Name</th>
              <th className="px-6 py-3">GSTIN</th>
              <th className="px-6 py-3">Address</th>
              <th className="px-6 py-3">Contact</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr 
                key={company.id} 
                className={`bg-white border-b hover:bg-gray-50 ${
                  currentCompany?.id === company.id ? 'bg-blue-50' : ''
                }`}
              >
                <td className="px-6 py-4 font-medium">
                  <div className="flex items-center">
                    {currentCompany?.id === company.id && (
                      <CheckCircle size={16} className="text-green-500 mr-2" />
                    )}
                    {company.name}
                  </div>
                </td>
                <td className="px-6 py-4">{company.gstin || '-'}</td>
                <td className="px-6 py-4">{company.address}</td>
                <td className="px-6 py-4">{company.phone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {currentCompany?.id !== company.id && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetActive(company)}
                      >
                        Set Active
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(company)}
                    >
                      <Edit size={16} className="text-blue-500" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(company.id)}
                      className="text-red-500 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyList;
