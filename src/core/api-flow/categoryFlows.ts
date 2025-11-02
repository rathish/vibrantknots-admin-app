import { IFlowExecution } from './orchestrator';
import { API_CONFIG } from './config';

// Fetch Categories Flow
export const fetchCategoriesFlow: IFlowExecution = {
  executeOn: "GET",
  startTransaction: {
    name: "fetchCategories",
    description: "Fetch all categories",
    executeOn: "always",
    method: "GET",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/categories`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

// Create Category Flow with Saga pattern
export const createCategoryFlow: IFlowExecution = {
  executeOn: "CREATE",
  startTransaction: {
    name: "createCategory",
    description: "Create new category",
    executeOn: "always",
    method: "POST",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/categories`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    next: {
      name: "refreshCategories",
      description: "Refresh category list after creation",
      executeOn: "always",
      method: "GET",
      transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/categories`,
      authorization: { headers: { 'Content-Type': 'application/json' } }
    }
  }
};

// Update Category Flow with Saga pattern
export const updateCategoryFlow: IFlowExecution = {
  executeOn: "UPDATE",
  startTransaction: {
    name: "updateCategory",
    description: "Update existing category",
    executeOn: "always",
    method: "PUT",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/categories/{id}`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    next: {
      name: "refreshCategories",
      description: "Refresh category list after update",
      executeOn: "always",
      method: "GET",
      transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/categories`,
      authorization: { headers: { 'Content-Type': 'application/json' } }
    }
  }
};

// Delete Category Flow with Saga pattern
export const deleteCategoryFlow: IFlowExecution = {
  executeOn: "DELETE",
  startTransaction: {
    name: "deleteCategory",
    description: "Delete category",
    executeOn: "always",
    method: "DELETE",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/categories/{id}`,
    authorization: { headers: { 'Content-Type': 'application/json' } },
    next: {
      name: "refreshCategories",
      description: "Refresh category list after deletion",
      executeOn: "always",
      method: "GET",
      transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/categories`,
      authorization: { headers: { 'Content-Type': 'application/json' } }
    }
  }
};
