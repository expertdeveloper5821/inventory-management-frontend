# Product Inventory Management Application

A full-stack Product Inventory Management application built with Angular and PrimeNG, integrated with Spring Boot backend.

## Features

- **Dashboard** with sortable, paginated table displaying product inventory
- **Stock Age Calculation** - Automatically calculates days between purchase date and today
- **Summary Cards** showing:
  - Total number of products
  - Total inventory value (Unit Price × Quantity)
  - Average stock age
- **Excel File Import** - Upload Excel files (.xlsx, .xls) to import product data
- **Backend Integration** - Connected to Spring Boot REST API
- **Pagination & Sorting** - Server-side pagination and sorting support

## Technology Stack

- **Frontend**: Angular 17
- **UI Library**: PrimeNG 17
- **Icons**: PrimeIcons
- **Language**: TypeScript
- **Backend**: Spring Boot (REST API)

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── dashboard/
│   │       ├── dashboard.component.ts
│   │       ├── dashboard.component.html
│   │       └── dashboard.component.scss
│   ├── models/
│   │   └── product.model.ts
│   ├── services/
│   │   └── mock-data.service.ts
│   ├── app.component.ts
│   └── app.routes.ts
├── index.html
├── main.ts
└── styles.scss
```

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Backend API running on `http://localhost:8080` (see backend README for setup)

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

## Development Setup

### ✅ No Backend Changes Required!

This frontend uses **Angular Proxy** to avoid CORS issues, so **no backend modifications are needed**.

### Quick Start

1. **Start the backend** (on port 8080):
   ```bash
   # In the backend directory
   docker run -p 8080:8080 inventory-backend
   ```
   Or follow the backend README for other setup methods.

2. **Start the Angular development server:**
   ```bash
   ng serve
   # or
   npm start
   ```

3. **Open your browser:**
   ```
   http://localhost:4200
   ```

### How It Works

- Angular dev server runs on `http://localhost:4200`
- Proxy configuration (`proxy.conf.json`) automatically routes `/api/*` requests to `http://localhost:8080`
- This avoids CORS issues without requiring any backend changes

### Configuration Files

- **`proxy.conf.json`** - Proxy configuration (already configured)
- **`angular.json`** - Includes proxy config in serve options
- **`src/app/services/product.service.ts`** - Uses relative URLs (`/api`) for API calls

## Build

Build the project for production:
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## API Endpoints

The frontend connects to the following backend endpoints:

- **GET** `/api/dashboard/products` - Get paginated product list
  - Query params: `page`, `size`, `sort`, `dir`
- **GET** `/api/dashboard/summary` - Get dashboard summary statistics
- **POST** `/api/import/excel` - Upload Excel file for import

## Product Model

Each product contains:
- **id** (Number) - Product ID
- **sku** (String) - Product SKU
- **name** (String) - Product Name
- **category** (String) - Category
- **purchaseDate** (String) - Purchase Date (YYYY-MM-DD format)
- **unitPrice** (Number) - Unit Price
- **quantity** (Number) - Quantity
- **stockAgeDays** (Number) - Stock Age in Days (calculated by backend)

## Excel File Format

When importing Excel files, ensure they follow this format:

| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| SKU | Product Name | Category | Purchase Date | Unit Price | Quantity |

- **Row 1**: Headers (optional, will be skipped)
- **Row 2+**: Data rows
- **SKU** is required
- **Purchase Date** format: YYYY-MM-DD (e.g., 2026-01-10)
- Supported formats: `.xlsx`, `.xls` (CSV not supported)

## Troubleshooting

### CORS Errors
- Make sure you're using `ng serve` (not building and serving static files)
- The proxy configuration handles CORS automatically during development

### API Not Working
- Verify backend is running on `http://localhost:8080`
- Check browser console for errors
- Verify `proxy.conf.json` exists in the project root

### Excel Import Fails
- Ensure file is `.xlsx` or `.xls` format (not CSV)
- Check that SKU column is not empty
- Verify date format is YYYY-MM-DD
- Check backend logs for detailed error messages

## Production Deployment

For production deployment:

1. **Option 1: Configure CORS on Backend**
   - Add CORS configuration to backend `WebConfig.java`
   - Update `product.service.ts` to use absolute URL: `http://your-backend-url/api`

2. **Option 2: Use Reverse Proxy**
   - Use nginx or similar to serve both frontend and backend from the same origin
   - This avoids CORS issues completely

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   └── dashboard/
│   │       ├── dashboard.component.ts
│   │       ├── dashboard.component.html
│   │       └── dashboard.component.scss
│   ├── models/
│   │   └── product.model.ts
│   ├── services/
│   │   └── product.service.ts
│   ├── app.component.ts
│   └── app.routes.ts
├── assets/
│   └── products.xlsx (sample file)
├── index.html
├── main.ts
└── styles.scss
```

## Additional Files

- **`proxy.conf.json`** - Angular proxy configuration for development
- **`FRONTEND_SETUP.md`** - Detailed setup instructions (if needed)
