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
  company: string;
  name: string;
  unitPrice: number;
  mrp?: number;
  gstPercentage?: number;
  hsn?: string;  
  godown : Godown[];
  stockQuantity: number;
  salesUnit: string;
  createdAt: string;
  rateAfterGst : number,
  allUnits : string,
  priceList : PriceLevel[]
}

export interface SaleItem {
  companyName: string;
  name: string;
  quantity: number;
  unitPrice: number;
  mrp?: number;
  discountValue?: number;
  discountPercentage?: number;
  gstPercentage?: number;
  gstAmount?: number;
  hsnCode?: string;
  packagingDetails?: string;
  totalPrice: number;
  totalAmount: number;
  salesUnit: string;
  godown?: string;
  priceLevelList: PriceLevel[];
  createdBy?: string;
  allUnits: string;
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
  companyId?: string;  // Made optional
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
