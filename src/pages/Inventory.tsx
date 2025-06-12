import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import ItemList from '../components/inventory/ItemList';
import { useInventory } from '../contexts/InventoryContext';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Inventory = () => {
  const { fetchItems } = useInventory();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncStock = async () => {
    setIsSyncing(true);
    try {
      await fetchItems(true);
      toast.success('Stock synced successfully!');
    } catch (err) {
      toast.error('Failed to sync stock.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Inventory</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={handleSyncStock}
              disabled={isSyncing}
              variant="outline"
              className="ml-2"
            >
              <RefreshCw className={isSyncing ? 'animate-spin mr-2 h-4 w-4' : 'mr-2 h-4 w-4'} />
              {isSyncing ? 'Syncing...' : 'Sync Stock'}
            </Button>
          </div>
        </div>

        <ItemList />
         
    
      </div>
    </MainLayout>
  );
};

const InventoryPage = () => <Inventory />;

export default InventoryPage;
