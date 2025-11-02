import { IFlowExecution } from './orchestrator';
import { API_CONFIG } from './config';

// Fetch Products Flow with parallel price/stock/variant fetching
export const fetchProductsFlow: IFlowExecution = {
  executeOn: "GET",
  startTransaction: {
    name: "fetchProducts",
    description: "Fetch all products with details",
    executeOn: "always",
    method: "GET",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/list`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    parallel: [
      {
        name: "fetchProductPrices",
        description: "Fetch price data for products",
        executeOn: "always",
        method: "GET",
        transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/prices`,
        authorization: { headers: { 'Content-Type': 'application/json' } }
      },
      {
        name: "fetchProductStock",
        description: "Fetch stock data for products", 
        executeOn: "always",
        method: "GET",
        transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/stock`,
        authorization: { headers: { 'Content-Type': 'application/json' } }
      }
    ]
  }
};

// Create Product Flow with Saga pattern
export const createProductFlow: IFlowExecution = {
  executeOn: "CREATE",
  startTransaction: {
    name: "createProduct",
    description: "Create new product",
    executeOn: "always",
    method: "POST",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    next: {
      name: "refreshProducts",
      description: "Refresh product list after creation",
      executeOn: "always",
      method: "GET",
      transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/list`,
      authorization: { headers: { 'Content-Type': 'application/json' } }
    }
  }
};

// Update Product Flow with Saga pattern
export const updateProductFlow: IFlowExecution = {
  executeOn: "UPDATE",
  startTransaction: {
    name: "updateProduct",
    description: "Update existing product",
    executeOn: "always",
    method: "PUT",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    next: {
      name: "refreshProducts",
      description: "Refresh product list after update",
      executeOn: "always",
      method: "GET",
      transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/list`,
      authorization: { headers: { 'Content-Type': 'application/json' } }
    }
  }
};

// Delete Product Flow with Saga pattern
export const deleteProductFlow: IFlowExecution = {
  executeOn: "DELETE",
  startTransaction: {
    name: "deleteProduct",
    description: "Delete product",
    executeOn: "always",
    method: "DELETE",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    next: {
      name: "refreshProducts",
      description: "Refresh product list after deletion",
      executeOn: "always",
      method: "GET",
      transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/list`,
      authorization: { headers: { 'Content-Type': 'application/json' } }
    }
  }
};

// Update Product Status Flow
export const updateProductStatusFlow: IFlowExecution = {
  executeOn: "UPDATE",
  startTransaction: {
    name: "updateProductStatus",
    description: "Update product status",
    executeOn: "always",
    method: "PUT",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}/status`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

// Upload Product Image Flow
export const uploadProductImageFlow: IFlowExecution = {
  executeOn: "CREATE",
  startTransaction: {
    name: "uploadProductImage",
    description: "Upload product image",
    executeOn: "always",
    method: "POST",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}/images`,
    authorization: { headers: { 'Content-Type': 'multipart/form-data' } }
  }
};

// Fetch Individual Product Flow
export const fetchProductFlow: IFlowExecution = {
  executeOn: "GET",
  startTransaction: {
    name: "fetchProduct",
    description: "Fetch individual product by ID",
    executeOn: "always",
    method: "GET",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{product_id}`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};
