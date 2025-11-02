import { IFlowExecution } from './orchestrator';
import { API_CONFIG } from './config';

export const fetchPartnersFlow: IFlowExecution = {
  executeOn: "GET",
  startTransaction: {
    name: "fetchPartners",
    description: "Fetch all partners",
    executeOn: "always",
    method: "GET",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/partners`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const createPartnerFlow: IFlowExecution = {
  executeOn: "CREATE",
  startTransaction: {
    name: "createPartner",
    description: "Create new partner",
    executeOn: "always",
    method: "POST",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/partners`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const fetchPartnerFlow: IFlowExecution = {
  executeOn: "GET",
  startTransaction: {
    name: "fetchPartner",
    description: "Fetch partner details",
    executeOn: "always",
    method: "GET",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/partners/{id}`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};

export const updatePartnerFlow: IFlowExecution = {
  executeOn: "UPDATE",
  startTransaction: {
    name: "updatePartner",
    description: "Update partner details",
    executeOn: "always",
    method: "PUT",
    transactionUrl: `${API_CONFIG.BASE_URL}/api/v1/partners/{id}`,
    authorization: { headers: { 'Content-Type': 'application/json' } }
  }
};
