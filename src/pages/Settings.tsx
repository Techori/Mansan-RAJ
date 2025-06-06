/**
 * Settings Page
 * Manages application configuration including Tally integration settings,
 * backup preferences, and other system-wide parameters.
 */

import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Settings = () => {
  const [tallyPort, setTallyPort] = useState('9000');
  const [tallyIP, setTallyIP] = useState('localhost');
  const [backupPath, setBackupPath] = useState('C:/POS_Backups');

  const handleSaveSettings = () => {
    // In a real app, we would save these settings to a database or local storage
    toast.success('Settings saved successfully');
  };

  const handleTestTallyConnection = () => {
    // In a real app, we would test the connection to Tally
    toast.success('Tally connection successful');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tally Integration</CardTitle>
              <CardDescription>Configure connection settings for Tally integration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tallyIP">Tally Server IP</Label>
                  <Input
                    id="tallyIP"
                    value={tallyIP}
                    onChange={(e) => setTallyIP(e.target.value)}
                    placeholder="e.g., localhost or 192.168.1.100"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tallyPort">Tally Port</Label>
                  <Input
                    id="tallyPort"
                    value={tallyPort}
                    onChange={(e) => setTallyPort(e.target.value)}
                  />
                </div>
              </div>
              
              <Button onClick={handleTestTallyConnection}>
                Test Connection
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Backup Settings</CardTitle>
              <CardDescription>Configure data backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backupPath">Backup Path</Label>
                <Input
                  id="backupPath"
                  value={backupPath}
                  onChange={(e) => setBackupPath(e.target.value)}
                  placeholder="e.g., C:/Backups"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline">
                  Manual Backup Now
                </Button>
                <Button variant="outline">
                  Restore from Backup
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

const SettingsPage = () => <Settings />;

export default SettingsPage;
