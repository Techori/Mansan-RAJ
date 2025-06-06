import React, { useState } from 'react';
import { useCustomers } from '../../contexts/CustomersContext';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CustomersList: React.FC = () => {
  const { groupedCustomers, selectedGroup, setSelectedGroup, filteredLedgers } = useCustomers();
  const [search, setSearch] = useState('');

  // Filter ledgers based on search
  const filteredResults = filteredLedgers.filter((ledger) => 
    ledger.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Group Selection */}
        <div className="w-[250px]">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger>
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {groupedCustomers.map((group) => (
                <SelectItem key={group.group} value={group.group}>
                  {group.group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search ledgers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filteredResults.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No ledgers found. Please select a different group or modify your search.</p>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr className="text-center">
                <th className="px-4 py-3 text-center">Ledger Name</th>
                <th className="px-4 py-3 text-center">Group</th>
              </tr>
            </thead>
            <tbody className="text-center">
              {filteredResults.map((ledger, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-center font-medium">{ledger}</td>
                  <td className="px-4 py-3 text-center">{selectedGroup}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomersList;
