
/**
 * Tally Sync Page
 * Manages integration with Tally ERP software including connection settings,
 * synchronization history, and manual sync operations.
 */

import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { CompanyProvider } from '../contexts/CompanyContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

const TallySync = () => {
  const [tallyHost, setTallyHost] = useState('localhost');
  const [tallyPort, setTallyPort] = useState('9000');
  const [defaultCompany, setDefaultCompany] = useState('Default');
  const [voucherType, setVoucherType] = useState('Sales');
  const [autoSync, setAutoSync] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    connection: 'disconnected',
    lastSynced: 'Today, 09:30 AM',
    pendingEntries: 3
  });
  const [syncHistory, setSyncHistory] = useState([
    {
      date: '2025-05-15',
      time: '09:30:45',
      status: 'success',
      entries: 12,
      message: 'All entries synced successfully'
    },
    {
      date: '2025-05-14',
      time: '17:22:10',
      status: 'error',
      entries: 8,
      message: 'Connection timeout. 5 entries failed to sync'
    },
    {
      date: '2025-05-13',
      time: '14:15:33',
      status: 'success',
      entries: 15,
      message: 'All entries synced successfully'
    },
    {
      date: '2025-05-12',
      time: '11:05:21',
      status: 'success',
      entries: 7,
      message: 'All entries synced successfully'
    },
    {
      date: '2025-05-11',
      time: '16:42:18',
      status: 'error',
      entries: 10,
      message: 'XML parsing error. Check voucher format'
    }
  ]);

  const handleSaveSettings = () => {
    toast.success('Tally connection settings saved successfully');
  };

  const handleTestConnection = () => {
    toast.success('Connection to Tally successful');
  };

  const handleSyncNow = () => {
    toast.success('Synchronization with Tally started');
    // Simulating sync process
    setTimeout(() => {
      setSyncStatus({
        ...syncStatus,
        lastSynced: new Date().toLocaleTimeString(),
        pendingEntries: 0
      });
      toast.success('All entries synced successfully');
    }, 2000);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Tally Integration</h2>
            <p className="text-muted-foreground">Configure and manage Tally ERP integration</p>
          </div>
          <Button onClick={handleSyncNow}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Now
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Tally Connection Settings</CardTitle>
                <CardDescription>Configure connection parameters for Tally ERP</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tallyHost">Tally Host</Label>
                    <Input
                      id="tallyHost"
                      value={tallyHost}
                      onChange={(e) => setTallyHost(e.target.value)}
                      placeholder="e.g., localhost"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tallyPort">Tally Port</Label>
                    <Input
                      id="tallyPort"
                      value={tallyPort}
                      onChange={(e) => setTallyPort(e.target.value)}
                      placeholder="e.g., 9000"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCompany">Default Company</Label>
                    <Select value={defaultCompany} onValueChange={setDefaultCompany}>
                      <SelectTrigger id="defaultCompany">
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Default">Default</SelectItem>
                        <SelectItem value="ABC Corporation">ABC Corporation</SelectItem>
                        <SelectItem value="XYZ Enterprises">XYZ Enterprises</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="voucherType">Voucher Type</Label>
                    <Select value={voucherType} onValueChange={setVoucherType}>
                      <SelectTrigger id="voucherType">
                        <SelectValue placeholder="Select voucher type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Purchase">Purchase</SelectItem>
                        <SelectItem value="Receipt">Receipt</SelectItem>
                        <SelectItem value="Payment">Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={autoSync} 
                    onCheckedChange={setAutoSync} 
                    id="auto-sync" 
                  />
                  <Label htmlFor="auto-sync">Enable Auto-Sync</Label>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleTestConnection}>
                    Test Connection
                  </Button>
                  <Button onClick={handleSaveSettings}>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sync Status</CardTitle>
              <CardDescription>Current integration status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Connection</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 capitalize">
                  Disconnected
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Auto-Sync</span>
                <span className="text-right font-medium">
                  {autoSync ? "Enabled" : "Disabled"}
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Last Synced</span>
                <span className="text-right font-medium">{syncStatus.lastSynced}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Pending Entries</span>
                <span className="text-right font-medium">{syncStatus.pendingEntries}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Sync History</CardTitle>
            <CardDescription>Recent Tally integration activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Time</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Entries</th>
                    <th className="px-4 py-2 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {syncHistory.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="px-4 py-2">{item.date}</td>
                      <td className="px-4 py-2">{item.time}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'success' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                        } capitalize`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{item.entries}</td>
                      <td className="px-4 py-2">{item.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

const TallySyncPage = () => (
  <CompanyProvider>
    <TallySync />
  </CompanyProvider>
);

export default TallySyncPage;
