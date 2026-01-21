export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  purchaseDate: string;
  unitPrice: number;
  quantity: number;
  stockAgeDays: number;
}

export interface DashboardSummary {
  totalProducts: number;
  totalInventoryValue: number;
  averageStockAge: number;
}

export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}