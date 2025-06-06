
import { Company, Godown, Item, Sale, SaleItem } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock Companies
export const companies: Company[] = [
  {
    id: '1',
    name: 'ABC Corporation',
    address: '123 Main St, Mumbai, India',
    phone: '+91 9876543210',
    email: 'info@abccorp.com',
    gstin: '27AAPFU0939F1ZV',
    gstNumber: '27AAPFU0939F1ZV',
    panNumber: 'ABCDE1234F',
    cinNumber: 'U72200MH2020PTC123456',
    tanNumber: 'MUMB12345A',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'XYZ Enterprises',
    address: '456 Park Ave, Delhi, India',
    phone: '+91 8765432109',
    email: 'contact@xyzent.com',
    gstin: '07AAACX9578M1ZP',
    gstNumber: '07AAACX9578M1ZP',
    panNumber: 'FGHIJ5678K',
    cinNumber: 'L17110DL1973PLC123456',
    tanNumber: 'DELH67890B',
    createdAt: new Date().toISOString()
  }
];

// Mock Godowns
export const godowns: Godown[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Main Godown',
    address: '123 Storage Lane, Mumbai',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 9876543210',
    email: 'godown1@abccorp.com',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    companyId: '1',
    name: 'Secondary Godown',
    address: '456 Warehouse Rd, Mumbai',
    contactPerson: 'Amit Singh',
    phone: '+91 9876543211',
    email: 'godown2@abccorp.com',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    companyId: '2',
    name: 'Main Godown',
    address: '789 Storage St, Delhi',
    contactPerson: 'Priya Sharma',
    phone: '+91 8765432109',
    email: 'godown@xyzent.com',
    createdAt: new Date().toISOString()
  }
];

// Mock Items
export const items: Item[] = [
  {
    id: '1',
    companyId: '1',
    itemId: 'SKU001',
    name: 'Laptop',
    type: 'GST',
    unitPrice: 45000,
    gstPercentage: 18,
    godownId: '1',
    stockQuantity: 50,
    salesUnit: 'Piece',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    companyId: '1',
    itemId: 'SKU002',
    name: 'Desk Chair',
    type: 'GST',
    unitPrice: 2500,
    gstPercentage: 12,
    godownId: '1',
    stockQuantity: 100,
    salesUnit: 'Piece',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    companyId: '1',
    itemId: 'SKU003',
    name: 'Notebook',
    type: 'NON-GST',
    unitPrice: 50,
    godownId: '2',
    stockQuantity: 500,
    salesUnit: 'Packet',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    companyId: '2',
    itemId: 'SKU001',
    name: 'Desktop Computer',
    type: 'GST',
    unitPrice: 35000,
    gstPercentage: 18,
    godownId: '3',
    stockQuantity: 30,
    salesUnit: 'Piece',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    companyId: '2',
    itemId: 'SKU002',
    name: 'Office Desk',
    type: 'GST',
    unitPrice: 5000,
    gstPercentage: 12,
    godownId: '3',
    stockQuantity: 45,
    salesUnit: 'Piece',
    createdAt: new Date().toISOString()
  }
];

// Mock Sales
export const sales: Sale[] = [
  {
    id: '1',
    companyId: '1',
    billNumber: 'INV-1001',
    date: new Date().toISOString(),
    customerName: 'John Doe',
    billType: 'GST',
    godownId: '1',
    totalAmount: 53100,
    items: [
      {
        itemId: '1',
        companyId: '1',
        companyName: 'ABC Corporation',
        name: 'Laptop',
        quantity: 1,
        unitPrice: 45000,
        gstPercentage: 18,
        gstAmount: 8100,
        totalPrice: 53100,
        totalAmount: 53100,
        salesUnit: 'Piece'
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    companyId: '1',
    billNumber: 'INV-1002',
    date: new Date().toISOString(),
    customerName: 'Jane Smith',
    billType: 'NON-GST',
    godownId: '2',
    totalAmount: 250,
    items: [
      {
        itemId: '3',
        companyId: '1',
        companyName: 'ABC Corporation',
        name: 'Notebook',
        quantity: 5,
        unitPrice: 50,
        totalPrice: 250,
        totalAmount: 250,
        salesUnit: 'Packet'
      }
    ],
    createdAt: new Date().toISOString()
  }
];

// Helper function to generate a unique ID
export const generateId = (): string => {
  return uuidv4();
};

// Helper function to generate a bill number
export const generateBillNumber = (prefix: string): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomNum}`;
};
