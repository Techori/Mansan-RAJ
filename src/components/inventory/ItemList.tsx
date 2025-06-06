import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useInventory } from '../../contexts/InventoryContext';
import { Item } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import Loader from '../ui/loader';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface ItemWithGodowns {
  name: string;
  company: string;
  unitPrice: number;
  mrp?: number;
  gstPercentage?: number;
  hsn?: string;
  godowns: Array<{ name: string; quantity: string }>;
  primaryItem: Item;
}

// Memoized select component for better performance
const GodownSelectMemo = memo(({ 
  godowns, 
  selectedGodown, 
  onGodownChange,
  itemName
}: { 
  godowns: Array<{ name: string; quantity: string }>;
  selectedGodown: string;
  onGodownChange: (itemName: string, godownName: string) => void;
  itemName: string;
}) => {
  const handleChange = useCallback((value: string) => {
    onGodownChange(itemName, value);
  }, [itemName, onGodownChange]);

  return (
    <Select
      value={selectedGodown || ''}
      onValueChange={handleChange}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select godown" />
      </SelectTrigger>
      <SelectContent>
        {godowns.map((godown) => (
          <SelectItem key={`${itemName}-${godown.name}`} value={godown.name}>
            {godown.name} ({godown.quantity})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
});

GodownSelectMemo.displayName = 'GodownSelectMemo';

// Memoized table cell component with primitive children only
const TableCellMemo = memo(({ children }: { children: React.ReactNode }) => (
  <TableCell className="py-2">{children}</TableCell>
));

TableCellMemo.displayName = 'TableCellMemo';

// Separate GodownCell component to prevent unnecessary re-renders
const GodownCell = memo(({ 
  godowns, 
  itemName, 
  selectedGodown, 
  onGodownChange 
}: { 
  godowns: Array<{ name: string; quantity: string }>;
  itemName: string;
  selectedGodown: string;
  onGodownChange: (itemName: string, godownName: string) => void;
}) => (
  <TableCell className="py-2">
    {godowns.length > 0 ? (
      <GodownSelectMemo
        godowns={godowns}
        selectedGodown={selectedGodown}
        onGodownChange={onGodownChange}
        itemName={itemName}
      />
    ) : (
      <span className="text-gray-500">No godown assigned</span>
    )}
  </TableCell>
));

GodownCell.displayName = 'GodownCell';

// Memoized table row component
const TableRowMemo = memo(({ 
  item,
  selectedGodown,
  onGodownChange,
  getCurrentQuantity,
  style
}: { 
  item: ItemWithGodowns;
  selectedGodown: string;
  onGodownChange: (itemName: string, godownName: string) => void;
  getCurrentQuantity: (item: ItemWithGodowns) => string;
  style?: React.CSSProperties;
}) => (
  <TableRow style={style}>
    <TableCellMemo>{item.name}</TableCellMemo>
    <TableCellMemo>{item.company}</TableCellMemo>
    <TableCellMemo>₹{item.unitPrice}</TableCellMemo>
    <TableCellMemo>{item.mrp}</TableCellMemo>
    <TableCellMemo>{item.gstPercentage || 0}</TableCellMemo>
    <TableCellMemo>{item.hsn}</TableCellMemo>
    <GodownCell
      godowns={item.godowns}
      itemName={item.name}
      selectedGodown={selectedGodown}
      onGodownChange={onGodownChange}
    />
    <TableCellMemo>{getCurrentQuantity(item)}</TableCellMemo>
  </TableRow>
));

TableRowMemo.displayName = 'TableRowMemo';

// Memoized table header
const TableHeaderMemo = memo(() => (
  <TableHeader className="sticky top-0 bg-white z-10">
    <TableRow>
      <TableHead className="py-2">Name</TableHead>
      <TableHead className="py-2">Company</TableHead>
      <TableHead className="py-2">Unit Price</TableHead>
      <TableHead className="py-2">MRP</TableHead>
      <TableHead className="py-2">GST %</TableHead>
      <TableHead className="py-2">HSN Code</TableHead>
      <TableHead className="py-2">Godown</TableHead>
      <TableHead className="py-2">Stock</TableHead>
    </TableRow>
  </TableHeader>
));

TableHeaderMemo.displayName = 'TableHeaderMemo';

const ROW_HEIGHT = 45; // Approximate height of each row

const ItemList: React.FC = () => {
  const { items, getAllItems, isLoading, error } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [selectedGodowns, setSelectedGodowns] = useState<Record<string, string>>({});

  const parentRef = useRef<HTMLDivElement>(null);
  const prevSearchRef = useRef(searchTerm);

  // Debounce search term
  useEffect(() => {
    if (prevSearchRef.current === searchTerm) return;
    prevSearchRef.current = searchTerm;
    
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Memoize the grouped items - only recalculate when items change
  const groupedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    
    const allItems = getAllItems();
    const grouped: Record<string, ItemWithGodowns> = {};
    
    allItems.forEach(item => {
      if (!item?.name) return;
      
      const key = item.name;
      
      if (!grouped[key]) {
        const godownsWithQuantity = item.godown ? item.godown.map(g => ({
          name: g.name,
          quantity: g.quantity
        })) : [];

        grouped[key] = {
          name: item.name,
          company: item.company,
          unitPrice: item.unitPrice,
          mrp: item.mrp,
          gstPercentage: item.gstPercentage,
          hsn: item.hsn,
          godowns: godownsWithQuantity,
          primaryItem: item
        };
      }
    });

    return Object.values(grouped);
  }, [items, getAllItems]);

  // Initialize selected godowns - memoized to prevent unnecessary updates
  const initializeGodowns = useCallback(() => {
    if (!groupedItems.length) return;
    
    setSelectedGodowns(prev => {
      const newGodowns = { ...prev };
      let hasChanges = false;

      groupedItems.forEach(item => {
        if (item.godowns.length > 0 && !newGodowns[item.name]) {
          newGodowns[item.name] = item.godowns[0].name;
          hasChanges = true;
        }
      });

      return hasChanges ? newGodowns : prev;
    });
  }, [groupedItems]);

  // Initialize godowns when items change
  useEffect(() => {
    initializeGodowns();
  }, [initializeGodowns]);

  // Memoize the filtered items - only recalculate when search term or grouped items change
  const filteredItems = useMemo(() => {
    if (!debouncedSearchTerm) return groupedItems;
    
    const searchTermLower = debouncedSearchTerm.toLowerCase();
    return groupedItems.filter(item =>
      item.name.toLowerCase().includes(searchTermLower) ||
      item.company.toLowerCase().includes(searchTermLower) ||
      item.hsn?.toLowerCase().includes(searchTermLower)
    );
  }, [groupedItems, debouncedSearchTerm]);
    
  // Memoize the getCurrentQuantity function
  const getCurrentQuantity = useCallback((item: ItemWithGodowns): string => {
    const selectedGodown = selectedGodowns[item.name];
    if (!selectedGodown) return '0';
    
    const godown = item.godowns.find(g => g.name === selectedGodown);
    return godown?.quantity || '0';
  }, [selectedGodowns]);

  // Memoize the handleGodownChange function
  const handleGodownChange = useCallback((itemName: string, godownName: string) => {
    setSelectedGodowns(prev => ({
      ...prev,
      [itemName]: godownName
    }));
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  if (isLoading || !items) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        Error: {error}
      </div>
    );
  }

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalHeight = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = virtualRows.length > 0 ? totalHeight - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center space-x-2 mb-4 flex-shrink-0">
        <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

      <Card className="flex-1 min-h-0">
        <CardContent className="p-0 h-full">
          <div ref={parentRef} className="h-full overflow-auto">
          <Table>
              <TableHeaderMemo />
              <TableBody>
                {filteredItems.length === 0 ? (
              <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      {groupedItems.length === 0 ? 'No items in inventory' : 'No items found'}
                    </TableCell>
                  </TableRow>
              ) : (
                  <>
                    {paddingTop > 0 && (
                      <tr>
                        <td style={{ height: `${paddingTop}px` }} />
                      </tr>
                    )}
                    {virtualRows.map((virtualRow) => (
                      <TableRowMemo
                        key={filteredItems[virtualRow.index].name}
                        item={filteredItems[virtualRow.index]}
                        selectedGodown={selectedGodowns[filteredItems[virtualRow.index].name] || ''}
                        onGodownChange={handleGodownChange}
                        getCurrentQuantity={getCurrentQuantity}
                        style={{
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      />
                    ))}
                    {paddingBottom > 0 && (
                      <tr>
                        <td style={{ height: `${paddingBottom}px` }} />
                      </tr>
                    )}
                  </>
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
        </Card>
    </div>
  );
};

export default memo(ItemList);
