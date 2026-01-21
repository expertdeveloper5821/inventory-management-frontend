import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  totalProducts: number = 0;
  totalInventoryValue: number = 0;
  averageStockAge: number = 0;
  loading: boolean = false;
  
  // Pagination properties
  currentPage: number = 0;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  sortField: string = 'purchaseDate';
  sortDirection: string = 'desc';

  constructor(
    private messageService: MessageService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadSummary();
  }

  loadProducts(): void {
    this.loading = true;
    this.productService.getProducts(this.currentPage, this.pageSize, this.sortField, this.sortDirection).subscribe({
      next: (page) => {
        this.products = page.content;
        this.totalElements = page.page.totalElements;
        this.totalPages = page.page.totalPages;
        // Update summary if summary endpoint failed
        if (this.totalProducts === 0 && this.totalElements > 0) {
          this.calculateSummaryFromProducts();
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products from backend.'
        });
        // eslint-disable-next-line no-console
        console.error('Failed to load products', err);
      }
    });
  }
  
  onPageChange(event: any): void {
    this.currentPage = event.first / event.rows; // PrimeNG uses first/rows, backend uses page/size
    this.pageSize = event.rows;
    if (event.sortField) {
      this.sortField = event.sortField;
      this.sortDirection = event.sortOrder === 1 ? 'asc' : 'desc';
    }
    this.loadProducts();
  }
  
  onSort(event: any): void {
    this.sortField = event.field;
    this.sortDirection = event.order === 1 ? 'asc' : 'desc';
    this.currentPage = 0; // Reset to first page on sort
    this.loadProducts();
  }

  loadSummary(): void {
    this.productService.getSummary().subscribe({
      next: (summary) => {
        this.totalProducts = summary.totalProducts;
        this.totalInventoryValue = summary.totalInventoryValue;
        this.averageStockAge = summary.averageStockAge;
      },
      error: (err) => {
        // If summary endpoint fails (e.g., 500 error), calculate from products list
        // This handles backend errors gracefully without breaking the UI
        this.calculateSummaryFromProducts();
        // eslint-disable-next-line no-console
        console.warn('Summary endpoint failed, using calculated values from products', err);
      }
    });
  }

  calculateSummaryFromProducts(): void {
    // Calculate summary from the current page of products
    // Note: This is approximate since we only have paginated data
    if (this.products.length > 0) {
      this.totalProducts = this.totalElements; // Use totalElements from pagination
      this.totalInventoryValue = this.products.reduce((total, product) => {
        return total + (product.unitPrice * product.quantity);
      }, 0);
      
      const validAges = this.products
        .filter(p => p.stockAgeDays != null && p.stockAgeDays >= 0)
        .map(p => p.stockAgeDays);
      
      if (validAges.length > 0) {
        this.averageStockAge = Math.round(
          validAges.reduce((sum, age) => sum + age, 0) / validAges.length * 10
        ) / 10; // Round to 1 decimal place
      } else {
        this.averageStockAge = 0;
      }
    }
  }


  triggerMainFileInput(): void {
    const fileInput = document.getElementById('mainFileInput') as HTMLInputElement;
    fileInput?.click();
  }

  onMainFileSelect(event: any): void {
    const file: File | undefined = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid File Type',
        detail: 'Please upload an Excel file (.xlsx or .xls)'
      });
      // Reset file input
      (event.target as HTMLInputElement).value = '';
      return;
    }

    const formData = new FormData();
    // The key 'file' matches backend @RequestParam("file")
    formData.append('file', file, file.name);

    this.loading = true;
    this.productService.uploadInventoryFile(formData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'File Imported',
          detail: `File "${file.name}" uploaded successfully.`
        });
        // Reset to first page and refresh data from backend
        this.currentPage = 0;
        this.loadProducts();
        this.loadSummary();
        this.loading = false;
        // Reset file input
        (event.target as HTMLInputElement).value = '';
      },
      error: (err) => {
        this.loading = false;
        let errorMessage = 'Failed to upload file to backend.';
        let errorTitle = 'Upload Failed';
        
        // Try to extract error message from response
        if (err.error) {
          if (typeof err.error === 'string') {
            try {
              // Try to parse as JSON array (validation errors)
              const parsed = JSON.parse(err.error);
              if (Array.isArray(parsed) && parsed.length > 0) {
                // Excel validation errors
                errorTitle = `Validation Errors (${parsed.length} found)`;
                errorMessage = parsed.map((e: any) => 
                  `Row ${e.row}, ${e.column}: ${e.message}`
                ).join('\n');
              } else if (parsed.message) {
                errorMessage = parsed.message;
              } else {
                errorMessage = err.error;
              }
            } catch {
              errorMessage = err.error;
            }
          } else if (Array.isArray(err.error)) {
            // Excel validation errors (already parsed)
            errorTitle = `Validation Errors (${err.error.length} found)`;
            errorMessage = err.error.map((e: any) => 
              `Row ${e.row}, ${e.column}: ${e.message}`
            ).join('\n');
          } else if (err.error.message) {
            errorMessage = err.error.message;
          }
        }
        
        // Show error message (split into multiple if too long)
        if (errorMessage.length > 200) {
          // For long messages, show first few errors and summary
          const lines = errorMessage.split('\n');
          const preview = lines.slice(0, 5).join('\n');
          const remaining = lines.length - 5;
          errorMessage = `${preview}\n\n... and ${remaining} more error(s). Check console for full details.`;
        }
        
        this.messageService.add({
          severity: 'error',
          summary: errorTitle,
          detail: errorMessage,
          life: 10000 // Show for 10 seconds for validation errors
        });
        // eslint-disable-next-line no-console
        console.error('Upload failed', err);
        // Reset file input
        (event.target as HTMLInputElement).value = '';
      }
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
