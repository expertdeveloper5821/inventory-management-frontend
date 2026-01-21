import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, DashboardSummary, Page } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Using relative URL for proxy support (no backend CORS changes needed)
  // Proxy configuration: proxy.conf.json routes /api to http://localhost:8080
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  uploadInventoryFile(formData: FormData): Observable<string> {
    return this.http.post<string>(`${this.baseUrl}/import/excel`, formData, {
      responseType: 'text' as 'json'
    });
  }

  getProducts(
    page: number = 0,
    size: number = 10,
    sort: string = 'purchaseDate',
    dir: string = 'desc'
  ): Observable<Page<Product>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort)
      .set('dir', dir);
    
    return this.http.get<Page<Product>>(`${this.baseUrl}/dashboard/products`, { params });
  }

  getSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }
}


