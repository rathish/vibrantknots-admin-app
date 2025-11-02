import { IFlowExecution } from './orchestrator';
import { API_CONFIG } from './config';

export const fetchProductStockFlow: IFlowExecution = {
  executeOn: "GET",
  startTransaction: {
    name: "fetchProductStock",
    description: "Fetch product stock data",
    executeOn: "always",
    method: "GET",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}/stock`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const updateProductStockFlow: IFlowExecution = {
  executeOn: "UPDATE",
  startTransaction: {
    name: "updateProductStock",
    description: "Update product stock",
    executeOn: "always",
    method: "PUT",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}/stock`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    next: {
      name: "refreshProducts",
      description: "Refresh product list after stock update",
      executeOn: "always",
      method: "GET",
      transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/list`,
      authorization: { headers: { 'Content-Type': 'application/json' } }
    }
  }
};

export const createProductStockFlow: IFlowExecution = {
  executeOn: "CREATE",
  startTransaction: {
    name: "createProductStock",
    description: "Create product stock record",
    executeOn: "always",
    method: "POST",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}/stock`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    next: {
      name: "refreshProducts",
      description: "Refresh product list after stock creation",
      executeOn: "always",
      method: "GET",
      transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/list`,
      authorization: { headers: { 'Content-Type': 'application/json' } }
    }
  }
};

export const fetchVariantStockFlow: IFlowExecution = {
  executeOn: "GET",
  startTransaction: {
    name: "fetchVariantStock",
    description: "Fetch variant stock records",
    executeOn: "always",
    method: "GET",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{productId}/variants/{variantId}/stock`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const createVariantStockFlow: IFlowExecution = {
  executeOn: "CREATE",
  startTransaction: {
    name: "createVariantStock",
    description: "Create variant stock record",
    executeOn: "always",
    method: "POST",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{productId}/variants/{variantId}/stock`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const updateVariantStockFlow: IFlowExecution = {
  executeOn: "UPDATE",
  startTransaction: {
    name: "updateVariantStock",
    description: "Update variant stock record",
    executeOn: "always",
    method: "PUT",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{productId}/variants/{variantId}/stock/{stockId}`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const deleteVariantStockFlow: IFlowExecution = {
  executeOn: "DELETE",
  startTransaction: {
    name: "deleteVariantStock",
    description: "Delete variant stock record",
    executeOn: "always",
    method: "DELETE",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{productId}/variants/{variantId}/stock/{stockId}`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};
