import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProductApiService, CategoryApiService, PriceApiService, StockApiService, VariantApiService, PartnerApiService } from '../core/api-flow/apiService';

const API_BASE_URL = 'http://localhost:8000';

export interface Product {
  product_id: string;
  title: string;
  description: string | null;
  images: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'DISCONTINUED';
  category_name: string | null;
  total_stock: number;
  min_retail_price: number;
  min_wholesale_price: number;
  variant_colors: string[];
  // Legacy fields for backward compatibility
  id?: string;
  sku_id?: string | null;
  material?: string | null;
  pattern?: string | null;
  color_primary?: string | null;
  colors?: Array<{code: string; name: string}>;
  width_estimate_cm?: number | null;
  scale?: string | null;
  special_features?: string[];
  image_urls?: {[key: string]: string};
  created_by?: string | null;
  category_id?: string;
  enabled?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  stock_records?: Array<{
    id: string;
    product_id: string;
    partner_id: string;
    partner_sku: string;
    quantity_available: number;
    quantity_reserved: number;
    reorder_level: number;
    wholesale_price: number;
    retail_price: number;
    currency: string;
    updated_by: string;
    updated_at: string;
  }>;
  variants?: Array<{
    id?: string;
    variant_name: string;
    color_name: string;
    color_code: string;
    sku_suffix: string;
    range_details: {[key: string]: any};
    additional_images?: {[key: string]: string};
    is_active: boolean;
  }>;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Partner {
  id: string;
  name: string;
  code: string;
  email: string;
  address: string;
}

interface CollectionsState {
  products: Product[];
  categories: Category[];
  partners: Partner[];
  loading: boolean;
  error: string | null;
  isDirty: boolean;
}

const initialState: CollectionsState = {
  products: [],
  categories: [],
  partners: [],
  loading: false,
  error: null,
  isDirty: false,
};

export const fetchProducts = createAsyncThunk(
  'collections/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/products/list');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const products = await response.json();
      return Array.isArray(products) ? products : [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'collections/fetchCategories',
  async (_, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      CategoryApiService.fetchCategories((stepName: string, status: string, result: any) => {
        if (status === "Completed" && stepName === "fetchCategories") {
          resolve(result.http_response);
        } else if (status === "Failed") {
          // Fallback to dummy data for testing
          const dummyCategories = require('../dummy-data/categories.json');
          resolve(dummyCategories);
        }
      });
    });
  }
);

export const fetchPartners = createAsyncThunk(
  'collections/fetchPartners',
  async (_, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      PartnerApiService.fetchPartners((stepName: string, status: string, result: any) => {
        console.log('fetchPartners callback:', { stepName, status, result });
        if ((status === "Completed" || status === "SUCCESS") && stepName === "fetchPartners") {
          const partners = result?.http_response || result || [];
          console.log('Partners fetched:', partners);
          resolve(partners);
        } else if (status === "Failed" || status === "ERROR") {
          console.log('Partners fetch failed:', result);
          resolve([]); // Return empty array on error
        }
      });
    });
  }
);

export const createProduct = createAsyncThunk(
  'collections/createProduct',
  async (productData: any, { rejectWithValue, dispatch }) => {
    return new Promise((resolve, reject) => {
      ProductApiService.createProduct(productData, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          if (stepName === "createProduct") {
            resolve(result.http_response);
          } else if (stepName === "refreshProducts") {
            dispatch(setProducts(result.http_response));
          }
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to create product'));
        }
      });
    });
  }
);

export const updateProduct = createAsyncThunk(
  'collections/updateProduct',
  async (product: Product, { rejectWithValue, dispatch }) => {
    return new Promise((resolve, reject) => {
      ProductApiService.updateProduct(product.id, product, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          if (stepName === "updateProduct") {
            resolve(result.http_response);
          } else if (stepName === "refreshProducts") {
            dispatch(setProducts(result.http_response));
          }
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to update product'));
        }
      });
    });
  }
);

export const deleteProduct = createAsyncThunk(
  'collections/deleteProduct',
  async (productId: string, { rejectWithValue, dispatch }) => {
    return new Promise((resolve, reject) => {
      ProductApiService.deleteProduct(productId, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          if (stepName === "deleteProduct") {
            resolve(productId);
          } else if (stepName === "refreshProducts") {
            dispatch(setProducts(result.http_response));
          }
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to delete product'));
        }
      });
    });
  }
);

export const createCategory = createAsyncThunk(
  'collections/createCategory',
  async (categoryData: any, { rejectWithValue, dispatch }) => {
    return new Promise((resolve, reject) => {
      CategoryApiService.createCategory(categoryData, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          if (stepName === "createCategory") {
            resolve(result.http_response);
          } else if (stepName === "refreshCategories") {
            dispatch(setCategories(result.http_response));
          }
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to create category'));
        }
      });
    });
  }
);

export const updateCategory = createAsyncThunk(
  'collections/updateCategory',
  async ({ id, ...categoryData }: any, { rejectWithValue, dispatch }) => {
    return new Promise((resolve, reject) => {
      CategoryApiService.updateCategory(id, categoryData, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          if (stepName === "updateCategory") {
            resolve(result.http_response);
          } else if (stepName === "refreshCategories") {
            dispatch(setCategories(result.http_response));
          }
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to update category'));
        }
      });
    });
  }
);

export const deleteCategory = createAsyncThunk(
  'collections/deleteCategory',
  async (categoryId: string, { rejectWithValue, dispatch }) => {
    return new Promise((resolve, reject) => {
      CategoryApiService.deleteCategory(categoryId, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          if (stepName === "deleteCategory") {
            resolve(categoryId);
          } else if (stepName === "refreshCategories") {
            dispatch(setCategories(result.http_response));
          }
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to delete category'));
        }
      });
    });
  }
);

export const uploadProductImage = createAsyncThunk(
  'collections/uploadProductImage',
  async ({ productId, imageFile }: { productId: string; imageFile: File }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      ProductApiService.uploadProductImage(productId, imageFile, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          resolve({ productId, imageUrl: result.http_response.url || result.http_response.image_url });
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to upload image'));
        }
      });
    });
  }
);

// Price operations
export const fetchProductPrice = createAsyncThunk(
  'collections/fetchProductPrice',
  async (productId: string, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      PriceApiService.fetchProductPrice(productId, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          resolve({ productId, priceData: result.http_response });
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to fetch price'));
        }
      });
    });
  }
);

export const updateProductPrice = createAsyncThunk(
  'collections/updateProductPrice',
  async ({ productId, priceData }: { productId: string; priceData: any }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      PriceApiService.updateProductPrice(productId, priceData, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          resolve({ productId, priceData: result.http_response });
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to update price'));
        }
      });
    });
  }
);

// Stock operations
export const fetchProductStock = createAsyncThunk(
  'collections/fetchProductStock',
  async (productId: string, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      StockApiService.fetchProductStock(productId, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          resolve({ productId, stockData: result.http_response });
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to fetch stock'));
        }
      });
    });
  }
);

export const updateProductStock = createAsyncThunk(
  'collections/updateProductStock',
  async ({ productId, stockData }: { productId: string; stockData: any }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      StockApiService.updateProductStock(productId, stockData, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          resolve({ productId, stockData: result.http_response });
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to update stock'));
        }
      });
    });
  }
);

// Variant operations
export const fetchProductVariants = createAsyncThunk(
  'collections/fetchProductVariants',
  async (productId: string, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      VariantApiService.fetchProductVariants(productId, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          resolve({ productId, variants: result.http_response });
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to fetch variants'));
        }
      });
    });
  }
);

export const createProductVariant = createAsyncThunk(
  'collections/createProductVariant',
  async ({ productId, variantData }: { productId: string; variantData: any }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      VariantApiService.createProductVariant(productId, variantData, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          resolve({ productId, variant: result.http_response });
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to create variant'));
        }
      });
    });
  }
);

export const updateProductVariant = createAsyncThunk(
  'collections/updateProductVariant',
  async ({ productId, variantId, variantData }: { productId: string; variantId: string; variantData: any }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      VariantApiService.updateProductVariant(productId, variantId, variantData, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          resolve({ productId, variantId, variant: result.http_response });
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to update variant'));
        }
      });
    });
  }
);

export const deleteProductVariant = createAsyncThunk(
  'collections/deleteProductVariant',
  async ({ productId, variantId }: { productId: string; variantId: string }, { rejectWithValue }) => {
    return new Promise((resolve, reject) => {
      VariantApiService.deleteProductVariant(productId, variantId, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          resolve({ productId, variantId });
        } else if (status === "Failed") {
          reject(rejectWithValue(result.http_response?.message || 'Failed to delete variant'));
        }
      });
    });
  }
);

const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    markDirty: (state) => {
      state.isDirty = true;
    },
    clearDirty: (state) => {
      state.isDirty = false;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.isDirty = false;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    updateProductStatus: (state, action: PayloadAction<{productId: string, status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'DISCONTINUED'}>) => {
      const product = state.products.find(p => (p.product_id || p.id) === action.payload.productId);
      if (product) {
        product.status = action.payload.status;
      }
      // Don't set isDirty to prevent automatic refetch
    },
    addImageToProduct: (state, action: PayloadAction<{productId: string, imageUrl: string}>) => {
      const product = state.products.find(p => p.id === action.payload.productId);
      if (product) {
        const timestamp = Date.now().toString();
        product.image_urls[timestamp] = action.payload.imageUrl;
      }
      state.isDirty = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = Array.isArray(action.payload) ? action.payload : action.payload.data || action.payload;
        state.isDirty = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch products';
      })
      // Fetch Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        // Handle both direct array and wrapped response
        state.categories = Array.isArray(action.payload) ? action.payload : action.payload.data || action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch categories';
      })
      // Fetch Partners
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.partners = Array.isArray(action.payload) ? action.payload : action.payload.data || action.payload;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.error = action.payload as string || 'Failed to fetch partners';
      })
      // Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      // Update Product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
      })
      // Upload Product Image
      .addCase(uploadProductImage.fulfilled, (state, action) => {
        const { productId, imageUrl } = action.payload;
        const product = state.products.find(p => p.id === productId);
        if (product && imageUrl) {
          // Add to image_urls object with timestamp as key
          const timestamp = Date.now().toString();
          product.image_urls[timestamp] = imageUrl;
        }
      })
      // Create Category
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      // Update Category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      // Delete Category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(c => c.id !== action.payload);
      })
      // Price operations
      .addCase(updateProductPrice.fulfilled, (state, action) => {
        const { productId, priceData } = action.payload;
        const product = state.products.find(p => p.id === productId);
        if (product) {
          product.price_table = priceData;
        }
      })
      // Stock operations
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const { productId, stockData } = action.payload;
        const product = state.products.find(p => p.id === productId);
        if (product) {
          product.stock = stockData;
        }
      })
      // Variant operations
      .addCase(fetchProductVariants.fulfilled, (state, action) => {
        const { productId, variants } = action.payload;
        const product = state.products.find(p => p.id === productId);
        if (product) {
          product.variants = variants;
        }
      })
      .addCase(createProductVariant.fulfilled, (state, action) => {
        const { productId, variant } = action.payload;
        const product = state.products.find(p => p.id === productId);
        if (product) {
          if (!product.variants) product.variants = [];
          product.variants.push(variant);
        }
      })
      .addCase(updateProductVariant.fulfilled, (state, action) => {
        const { productId, variantId, variant } = action.payload;
        const product = state.products.find(p => p.id === productId);
        if (product && product.variants) {
          const variantIndex = product.variants.findIndex(v => v.id === variantId);
          if (variantIndex !== -1) {
            product.variants[variantIndex] = variant;
          }
        }
      })
      .addCase(deleteProductVariant.fulfilled, (state, action) => {
        const { productId, variantId } = action.payload;
        const product = state.products.find(p => p.id === productId);
        if (product && product.variants) {
          product.variants = product.variants.filter(v => v.id !== variantId);
        }
      });
  },
});

export const { addImageToProduct, markDirty, clearDirty, updateProductStatus, setProducts, setCategories } = collectionsSlice.actions;
export default collectionsSlice.reducer;
