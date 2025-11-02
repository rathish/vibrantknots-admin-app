import { api_orchestrator } from './orchestrator';
import { 
  fetchProductsFlow, 
  createProductFlow, 
  updateProductFlow, 
  deleteProductFlow,
  updateProductStatusFlow,
  uploadProductImageFlow,
  fetchProductFlow
} from './productFlows';
import {
  fetchCategoriesFlow,
  createCategoryFlow,
  updateCategoryFlow,
  deleteCategoryFlow
} from './categoryFlows';
import {
  fetchProductPriceFlow,
  updateProductPriceFlow
} from './priceFlows';
import {
  fetchProductStockFlow,
  updateProductStockFlow,
  createProductStockFlow,
  fetchVariantStockFlow,
  createVariantStockFlow,
  updateVariantStockFlow,
  deleteVariantStockFlow
} from './stockFlows';
import {
  fetchProductVariantsFlow,
  createProductVariantFlow,
  updateProductVariantFlow,
  deleteProductVariantFlow
} from './variantFlows';
import {
  fetchPartnersFlow,
  createPartnerFlow,
  fetchPartnerFlow,
  updatePartnerFlow
} from './partnerFlows';

export class ProductApiService {
  
  static fetchProducts(callback: (stepName: string, status: string, result: any) => void) {
    api_orchestrator("GET", {
      ...fetchProductsFlow,
      executionCallBack: callback
    });
  }

  static fetchProduct(
    productId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("GET", {
      ...fetchProductFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "fetchProduct") {
          return {
            transactionUrl: url.replace('{product_id}', productId),
            transactionMethod: "GET" as const
          };
        }
        return { transactionUrl: url, transactionMethod: "GET" as const };
      }
    });
  }

  static createProduct(
    productData: any, 
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("CREATE", {
      ...createProductFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "createProduct") {
          return productData;
        }
        return null;
      }
    });
  }

  static updateProduct(
    productId: string,
    productData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("UPDATE", {
      ...updateProductFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "updateProduct") {
          return productData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "updateProduct") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "PUT" as const
          };
        }
        return null;
      }
    });
  }

  static deleteProduct(
    productId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("DELETE", {
      ...deleteProductFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "deleteProduct") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "DELETE" as const
          };
        }
        return null;
      }
    });
  }

  static updateProductStatus(
    productId: string,
    status: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("UPDATE", {
      ...updateProductStatusFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "updateProductStatus") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "PUT" as const
          };
        }
        return null;
      },
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "updateProductStatus") {
          return { status };
        }
        return null;
      }
    });
  }

  static uploadProductImage(
    productId: string,
    imageFile: File,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    api_orchestrator("CREATE", {
      ...uploadProductImageFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "uploadProductImage") {
          return formData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "uploadProductImage") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "POST" as const
          };
        }
        return null;
      }
    });
  }
}

export class CategoryApiService {
  
  static fetchCategories(callback: (stepName: string, status: string, result: any) => void) {
    api_orchestrator("GET", {
      ...fetchCategoriesFlow,
      executionCallBack: callback
    });
  }

  static createCategory(
    categoryData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("CREATE", {
      ...createCategoryFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "createCategory") {
          return categoryData;
        }
        return null;
      }
    });
  }

  static updateCategory(
    categoryId: string,
    categoryData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("UPDATE", {
      ...updateCategoryFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "updateCategory") {
          return categoryData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "updateCategory") {
          return {
            transactionUrl: url.replace('{id}', categoryId),
            transactionMethod: "PUT" as const
          };
        }
        return null;
      }
    });
  }

  static deleteCategory(
    categoryId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("DELETE", {
      ...deleteCategoryFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "deleteCategory") {
          return {
            transactionUrl: url.replace('{id}', categoryId),
            transactionMethod: "DELETE" as const
          };
        }
        return null;
      }
    });
  }
}

export class PriceApiService {
  
  static fetchProductPrice(
    productId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("GET", {
      ...fetchProductPriceFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "fetchProductPrice") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "GET" as const
          };
        }
        return null;
      }
    });
  }

  static updateProductPrice(
    productId: string,
    priceData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("UPDATE", {
      ...updateProductPriceFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "updateProductPrice") {
          return priceData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "updateProductPrice") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "PUT" as const
          };
        }
        return null;
      }
    });
  }
}

export class StockApiService {
  
  static fetchProductStock(
    productId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("GET", {
      ...fetchProductStockFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "fetchProductStock") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "GET" as const
          };
        }
        return null;
      }
    });
  }

  static updateProductStock(
    productId: string,
    stockData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("UPDATE", {
      ...updateProductStockFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "updateProductStock") {
          return stockData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "updateProductStock") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "PUT" as const
          };
        }
        return null;
      }
    });
  }

  static createProductStock(
    productId: string,
    stockData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("CREATE", {
      ...createProductStockFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "createProductStock") {
          return stockData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "createProductStock") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "POST" as const
          };
        }
        return null;
      }
    });
  }

  static fetchVariantStock(
    productId: string,
    variantId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    // Create a new flow instance to prevent URL reuse
    const flowInstance = {
      ...fetchVariantStockFlow,
      startTransaction: {
        ...fetchVariantStockFlow.startTransaction,
        transactionUrl: fetchVariantStockFlow.startTransaction.transactionUrl
      }
    };
    
    api_orchestrator("GET", {
      ...flowInstance,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "fetchVariantStock") {
          return {
            transactionUrl: url.replace('{productId}', productId).replace('{variantId}', variantId),
            transactionMethod: "GET" as const
          };
        }
        return null;
      }
    });
  }

  static createVariantStock(
    productId: string,
    variantId: string,
    stockData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("CREATE", {
      ...createVariantStockFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "createVariantStock") {
          return stockData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "createVariantStock") {
          return {
            transactionUrl: url.replace('{productId}', productId).replace('{variantId}', variantId),
            transactionMethod: "POST" as const
          };
        }
        return null;
      }
    });
  }

  static updateVariantStock(
    productId: string,
    variantId: string,
    stockId: string,
    stockData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("UPDATE", {
      ...updateVariantStockFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "updateVariantStock") {
          return stockData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "updateVariantStock") {
          return {
            transactionUrl: url.replace('{productId}', productId).replace('{variantId}', variantId).replace('{stockId}', stockId),
            transactionMethod: "PUT" as const
          };
        }
        return null;
      }
    });
  }

  static deleteVariantStock(
    productId: string,
    variantId: string,
    stockId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("DELETE", {
      ...deleteVariantStockFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "deleteVariantStock") {
          return {
            transactionUrl: url.replace('{productId}', productId).replace('{variantId}', variantId).replace('{stockId}', stockId),
            transactionMethod: "DELETE" as const
          };
        }
        return null;
      }
    });
  }
}

export class VariantApiService {
  
  static fetchProductVariants(
    productId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("GET", {
      ...fetchProductVariantsFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "fetchProductVariants") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "GET" as const
          };
        }
        return null;
      }
    });
  }

  static createProductVariant(
    productId: string,
    variantData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("CREATE", {
      ...createProductVariantFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "createProductVariant") {
          return variantData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "createProductVariant") {
          return {
            transactionUrl: url.replace('{id}', productId),
            transactionMethod: "POST" as const
          };
        }
        return null;
      }
    });
  }

  static updateProductVariant(
    productId: string,
    variantId: string,
    variantData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("UPDATE", {
      ...updateProductVariantFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "updateProductVariant") {
          return variantData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "updateProductVariant") {
          return {
            transactionUrl: url.replace('{productId}', productId).replace('{variantId}', variantId),
            transactionMethod: "PUT" as const
          };
        }
        return null;
      }
    });
  }

  static deleteProductVariant(
    productId: string,
    variantId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("DELETE", {
      ...deleteProductVariantFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "deleteProductVariant") {
          return {
            transactionUrl: url.replace('{productId}', productId).replace('{variantId}', variantId),
            transactionMethod: "DELETE" as const
          };
        }
        return null;
      }
    });
  }
}

export class PartnerApiService {
  
  static fetchPartners(callback: (stepName: string, status: string, result: any) => void) {
    api_orchestrator("GET", {
      ...fetchPartnersFlow,
      executionCallBack: callback
    });
  }

  static createPartner(
    partnerData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("CREATE", {
      ...createPartnerFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "createPartner") {
          return partnerData;
        }
        return null;
      }
    });
  }

  static fetchPartner(
    partnerId: string,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("GET", {
      ...fetchPartnerFlow,
      executionCallBack: callback,
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "fetchPartner") {
          return {
            transactionUrl: url.replace('{id}', partnerId),
            transactionMethod: "GET" as const
          };
        }
        return null;
      }
    });
  }

  static updatePartner(
    partnerId: string,
    partnerData: any,
    callback: (stepName: string, status: string, result: any) => void
  ) {
    api_orchestrator("UPDATE", {
      ...updatePartnerFlow,
      executionCallBack: callback,
      payLoadMappingCallBack: (stepName: string) => {
        if (stepName === "updatePartner") {
          return partnerData;
        }
        return null;
      },
      changeUrlCallBack: (stepName: string, url: string) => {
        if (stepName === "updatePartner") {
          return {
            transactionUrl: url.replace('{id}', partnerId),
            transactionMethod: "PUT" as const
          };
        }
        return null;
      }
    });
  }
}
