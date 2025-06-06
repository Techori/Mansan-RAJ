export interface Company {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  panNumber: string;
  cinNumber: string;
  tanNumber: string;
  gstin: string; // Added this field as it's being used
  createdAt: string;
}

export interface Godown {
  name: string,
  quantity: string
}

export interface PriceLevel {
  rate : string,
  ending_at : string,
  starting_at : string

}


export interface Item {
  id: string;
  company: string;
  companyId : string
  // itemId: string;
  name: string;
  // type: 'GST' | 'NON-GST';
  unitPrice: number;
  mrp?: number;
  gstPercentage?: number;
  hsn?: string;  
  // godownId: string;
  godown : Godown[],
  stockQuantity: number;
  salesUnit: 'Case' | 'Packet' | 'Piece';
  createdAt: string;
  rateAfterGst : number,
  priceList : PriceLevel[]
}

export interface SaleItem {
  itemId: string;
  companyId: string;
  companyName: string;
  name: string;
  quantity: number;
  unitPrice: number; // Exclusive cost (without GST)
  mrp?: number; // MRP (inclusive of GST)
  discountValue?: number; // Discount amount in rupees
  discountPercentage?: number; // Discount percentage
  gstPercentage?: number;
  gstAmount?: number;
  hsnCode?: string;
  packagingDetails?: string; // Added packaging details for Estimate company
  totalPrice: number; // Final price after GST and discount
  totalAmount: number;
  salesUnit: string;
  godown: Godown[];
}

// Customer Type
export interface Customer {
  name: string;
  phone: string;
  email: string;
  gstNumber?: string;
  address: string;
  createdAt: string;
}

// Sale Type
export interface Sale {
  id: string;
  companyId: string;
  companyName: string;
  billNumber: string;
  date: string;
  customerName: string;
  billType: 'GST' | 'NON-GST';
  godownId?: string;
  totalAmount: number;
  totalDiscount?: number;
  totalExclusiveCost?: number;
  totalGst?: number;
  taxInvoiceNo?: string;  // Added tax invoice number field
  estimateNo?: string;    // Added estimate number field
  partyAccount?: string;  // Added party account field
  customerMobile?: string; // Added customer mobile field
  extraValue?: string;     // Added extra value field
  items: SaleItem[];
  // createdBy: string;
  createdAt: string;
}

// Company Context Type
export interface CompanyContextType {
  companies: Company[];
  currentCompany: Company | null;
  setCurrentCompany: (company: Company) => void;
  addCompany: (companyData: Omit<Company, 'id' | 'createdAt'>) => void;
  updateCompany: (company: Company) => void;
  deleteCompany: (id: string) => void;
}

// Dashboard Analytics Types
export interface DashboardAnalytics {
  totalSales: number;
  totalBills: number;
  companyRevenue: {
    companyId: string;
    companyName: string;
    revenue: number;
    billCount: number;
  }[];
  gstSales: number;
  nonGstSales: number;
  totalDiscounts: number;
  topItems: {
    companyId: string;
    companyName: string;
    itemId: string;
    itemName: string;
    quantity: number;
    revenue: number;
  }[];
}
