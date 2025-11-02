import { IFlowExecution } from './orchestrator';
import { API_CONFIG } from './config';

export const fetchProductVariantsFlow: IFlowExecution = {
  executeOn: "GET",
  startTransaction: {
    name: "fetchProductVariants",
    description: "Fetch product variants",
    executeOn: "always",
    method: "GET",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}/variants`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const createProductVariantFlow: IFlowExecution = {
  executeOn: "CREATE",
  startTransaction: {
    name: "createProductVariant",
    description: "Create product variant",
    executeOn: "always",
    method: "POST",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{id}/variants`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const updateProductVariantFlow: IFlowExecution = {
  executeOn: "UPDATE",
  startTransaction: {
    name: "updateProductVariant",
    description: "Update product variant",
    executeOn: "always",
    method: "PUT",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{productId}/variants/{variantId}`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const deleteProductVariantFlow: IFlowExecution = {
  executeOn: "DELETE",
  startTransaction: {
    name: "deleteProductVariant",
    description: "Delete product variant",
    executeOn: "always",
    method: "DELETE",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/products/{productId}/variants/{variantId}`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};
