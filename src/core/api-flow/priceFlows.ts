import { IFlowExecution } from './orchestrator';
import { API_CONFIG } from './config';

export const fetchProductPriceFlow: IFlowExecution = {
  executeOn: "GET",
  startTransaction: {
    name: "fetchProductPrice",
    description: "Fetch product price data",
    executeOn: "always",
    method: "GET",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}/prices`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const updateProductPriceFlow: IFlowExecution = {
  executeOn: "UPDATE",
  startTransaction: {
    name: "updateProductPrice",
    description: "Update product price",
    executeOn: "always",
    method: "PUT",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}/prices`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    next: {
      name: "refreshProducts",
      description: "Refresh product list after price update",
      executeOn: "always",
      method: "GET",
      transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/list`,
      authorization: { headers: { 'Content-Type': 'application/json' } }
    }
  }
};
