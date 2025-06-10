import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCustomers } from '../../contexts/CustomersContext';
import { useCompany } from '../../contexts/CompanyContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckIcon, ChevronDown, Plus, Phone } from 'lucide-react';
import { cn } from "@/lib/utils";

// Add interface for phone mapping
interface PhoneMapping {
  phone: string;
  billerName: string;
}

interface CustomerInfoProps {
  customerName: string;
  onCustomerNameChange: (name: string) => void;
  onAddCustomer: (customer: any) => void;
  taxInvoiceNo?: string;
  onTaxInvoiceNoChange?: (value: string) => void;
  estimateNo?: string;
  onEstimateNoChange?: (value: string) => void;
  priceLevel?: string;
  onPriceLevelChange?: (value: string) => void;
  customerMobile?: string;
  onCustomerMobileChange?: (value: string) => void;
  extraValue?: string;
  onExtraValueChange?: (value: string) => void;
  priceLevels?: { id: string; name: string }[];
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({
  customerName,
  onCustomerNameChange,
  onAddCustomer,
  taxInvoiceNo = '',
  onTaxInvoiceNoChange = () => {},
  estimateNo = '',
  onEstimateNoChange = () => {},
  priceLevel = '',
  onPriceLevelChange = () => {},
  customerMobile = '',
  onCustomerMobileChange = () => {},
  extraValue = '',
  onExtraValueChange = () => {},
  priceLevels = [],
}) => {
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);
  const [inputValue, setInputValue] = useState(customerName);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { groupedCustomers } = useCustomers();

  // Add state for phone mappings (in real app, this might come from a context or localStorage)
  const [phoneMappings, setPhoneMappings] = useState<PhoneMapping[]>(() => {
    const savedMappings = localStorage.getItem('phoneMappings');
    return savedMappings ? JSON.parse(savedMappings) : [];
  });

  // Save mappings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('phoneMappings', JSON.stringify(phoneMappings));
  }, [phoneMappings]);

  // Function to handle adding new phone mapping
  const handleAddPhoneMapping = useCallback(() => {
    if (!customerMobile || !extraValue) return;

    setPhoneMappings(prev => {
      const exists = prev.some(mapping => mapping.phone === customerMobile);
      if (exists) {
        return prev.map(mapping =>
          mapping.phone === customerMobile
            ? { ...mapping, billerName: extraValue }
            : mapping
        );
      }
      return [...prev, { phone: customerMobile, billerName: extraValue }];
    });
  }, [customerMobile, extraValue]);

  // Function to handle phone number change with mapping lookup
  const handlePhoneChange = useCallback((value: string) => {
    onCustomerMobileChange(value);

    if (!value.trim()) {
      // Clear biller name when phone number is cleared
      onExtraValueChange('');
      return;
    }

    // Look for matching phone number in mappings
    const mapping = phoneMappings.find(m => m.phone === value);
    if (mapping) {
      onExtraValueChange(mapping.billerName);
    }
  }, [onCustomerMobileChange, phoneMappings, onExtraValueChange]);

  // Combine all ledgers from all groups - memoized and only updates when groupedCustomers changes
  const allLedgers = useMemo(() => {
    return groupedCustomers.flatMap(group =>
      group.ledgers.map(ledger => ({
        name: ledger,
        group: group.group
      }))
    );
  }, [groupedCustomers]);

  // Debounced search term update
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(inputValue.toLowerCase());
    }, 150); // 150ms delay

    return () => clearTimeout(timer);
  }, [inputValue]);

  // Filter ledgers based on debounced search - memoized and only updates when search term changes
  const filteredLedgers = useMemo(() => {
    if (!debouncedSearchTerm) return [];
    return allLedgers.filter(ledger =>
      ledger.name.toLowerCase().includes(debouncedSearchTerm) ||
      ledger.group.toLowerCase().includes(debouncedSearchTerm)
    ).slice(0, 100); // Limit to first 100 results for performance
  }, [allLedgers, debouncedSearchTerm]);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onCustomerNameChange(value);
    setIsCustomerPopoverOpen(true);
  }, [onCustomerNameChange]);

  // Handle selection
  const handleSelection = useCallback((ledger: { name: string, group: string }) => {
    setInputValue(ledger.name);
    onCustomerNameChange(ledger.name);
    setIsCustomerPopoverOpen(false);
  }, [onCustomerNameChange]);

  // Update input value when customerName prop changes
  useEffect(() => {
    setInputValue(customerName);
  }, [customerName]);

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-4">
        <div className="space-y-2">
          <Label htmlFor="taxInvoiceNo">Tax Invoice No.</Label>
          <Input
            id="taxInvoiceNo"
            value={taxInvoiceNo}
            onChange={e => onTaxInvoiceNoChange(e.target.value)}
            placeholder="Enter tax invoice number"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimateNo">Estimate No.</Label>
          <Input
            id="estimateNo"
            value={estimateNo}
            onChange={e => onEstimateNoChange(e.target.value)}
            placeholder="Enter estimate number"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        {/* Customer Selection */}
        <div className="space-y-2">
          <Label htmlFor="customerName">Customer Name *</Label>
          <div className="relative">
            <Input
              id="customerName"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsCustomerPopoverOpen(true)}
              placeholder="Enter or select customer"
              className="w-full pr-8"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
              onClick={() => setIsCustomerPopoverOpen(!isCustomerPopoverOpen)}
            >
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
            {isCustomerPopoverOpen && filteredLedgers.length > 0 && (
              <div
                className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200"
              >
                <div className="max-h-[300px] overflow-auto py-1">
                  {filteredLedgers.map((ledger, index) => (
                    <button
                      key={index}
                      type="button"
                      className={cn(
                        "w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-100",
                        inputValue === ledger.name && "bg-gray-50"
                      )}
                      onClick={() => handleSelection(ledger)}
                    >
                      <CheckIcon
                        className={cn(
                          "h-4 w-4",
                          inputValue === ledger.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <div className="font-medium">{ledger.name}</div>
                        <div className="text-xs text-gray-500">{ledger.group}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Party A/c Name Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="priceLevel">Price Level</Label>
          <Select value={priceLevel} onValueChange={onPriceLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Price Level" />
            </SelectTrigger>
            <SelectContent>
              {priceLevels.map((priceL) => (
                <SelectItem key={priceL.id} value={priceL.id}>
                  {priceL.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Customer Mobile */}
        <div className="space-y-2">
          <Label htmlFor="customerMobile" className="flex items-center gap-2">
            Customer Mob. <Phone className="h-4 w-4 text-gray-400" />
          </Label>
          <Input
            id="customerMobile"
            value={customerMobile}
            onChange={e => handlePhoneChange(e.target.value)}
            placeholder="Enter mobile number"
          />
        </div>

        {/* Biller Name Field with Mapping Status */}
        <div className="space-y-2">
          <Label htmlFor="extraValue">Biller Name</Label>
          <div className="flex items-center gap-2">
            <Input
              id="extraValue"
              value={extraValue}
              onChange={e => onExtraValueChange(e.target.value)}
              placeholder="Enter Biller Name"
              className="w-[300px]"
            />
            <div className="flex items-center gap-1 min-w-[100px]">
              {customerMobile && extraValue && !phoneMappings.some(m => m.phone === customerMobile) && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-gray-100 flex-shrink-0"
                  onClick={handleAddPhoneMapping}
                  title="Map phone to biller"
                >
                  <Plus className="h-5 w-5 text-blue-500" />
                </Button>
              )}
              {customerMobile && phoneMappings.some(m => m.phone === customerMobile) && (
                <span className="text-xs text-green-600 whitespace-nowrap">✓ Mapped</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CustomerInfo; 