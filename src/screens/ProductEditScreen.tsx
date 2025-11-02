import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Image, StyleSheet, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { markDirty, fetchPartners } from '../store/collectionsSlice';
import { 
  ProductApiService, 
  PriceApiService, 
  StockApiService, 
  VariantApiService,
  PartnerApiService 
} from '../core/api-flow/apiService';
import StockRecordForm from './StockRecordForm';

// Internationalization strings
const strings = {
  editProduct: 'Edit Product',
  save: 'Save',
  basicInfo: 'Basic Information',
  title: 'Title',
  sku: 'SKU ID',
  description: 'Description',
  material: 'Material',
  dimensions: 'Dimensions',
  weight: 'Weight',
  categories: 'Categories',
  pricing: 'Pricing',
  basePrice: 'Base Price',
  currency: 'Currency',
  stock: 'Stock Management',
  currentStock: 'Current Stock',
  reservedStock: 'Reserved Stock',
  variants: 'Variants',
  images: 'Images',
  addImage: 'Add Image',
  selectColor: 'Select Color',
  colorFromCamera: 'Color from Camera',
  colorFromPalette: 'Color from Palette',
  success: 'Success',
  error: 'Error',
  productUpdated: 'Product updated successfully',
  updateFailed: 'Failed to update product',
  cancel: 'Cancel',
  confirm: 'Confirm'
};

interface Product {
  id: string;
  title: string;
  sku_id?: string;
  description?: string;
  material?: string;
  dimensions?: string;
  weight_kg?: number;
  category_id?: string;
  base_price?: number;
  currency?: string;
  image_urls?: Record<string, string>;
  variants?: Variant[];
  stock?: Stock;
}

interface Variant {
  id?: string;
  variant_name: string;
  color_code: string;
  color_name: string;
  sku_suffix?: string;
  stock_records?: StockRecord[];
}

interface StockRecord {
  id?: string;
  partner_id: string;
  quantity_available: number;
  retail_price: number;
  wholesale_price?: number;
  currency: string;
}

interface Price {
  id?: string;
  currency: string;
  base_price: number;
  sale_price?: number;
  effective_from?: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductEditScreenProps {
  navigation: {
    goBack: () => void;
  };
  product: Product;
}

export default function ProductEditScreen({ navigation, product }: ProductEditScreenProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { categories, partners } = useAppSelector((state) => state.collections);
  
  const [editedProduct, setEditedProduct] = useState<Product>(product);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [newStockModalVisible, setNewStockModalVisible] = useState(false);
  const [newVariantModalVisible, setNewVariantModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedStockIndex, setSelectedStockIndex] = useState(0);
  const [partnerDetails, setPartnerDetails] = useState<any>(null);
  const [newVariantData, setNewVariantData] = useState({ 
    variant_name: '', 
    color_code: '#FF0000', 
    color_name: '', 
    material: 'cotton',
    pattern: 'solid',
    sku_suffix: '' 
  });
  const [partnerCodes, setPartnerCodes] = useState<Record<string, string>>({});
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch partner codes for display using Redux partners
  const fetchPartnerCodes = (stockRecords: any[]) => {
    const partnerIds = [...new Set(stockRecords.map(stock => stock.partner_id))];
    
    setPartnerCodes(prevCodes => {
      const codes = { ...prevCodes };
      
      partnerIds.forEach(partnerId => {
        if (!codes[partnerId] && partnerId) { // Only update if not already present and partnerId exists
          const partner = partners.find(p => p.id === partnerId);
          if (partner) {
            codes[partnerId] = partner.code || partner.name;
          } else {
            codes[partnerId] = partnerId.substring(0, 8);
          }
        }
      });
      
      return codes;
    });
  };

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
    '#FFA500', '#FFC0CB', '#A52A2A', '#808080', '#000000', '#FFFFFF'
  ];

  useEffect(() => {
    fetchProductDetails();
    if (partners.length === 0) {
      dispatch(fetchPartners());
    }
  }, [partners.length, dispatch]);

  const addVariant = () => {
    // Reset form data
    setNewVariantData({ 
      variant_name: '', 
      color_code: '#FF0000', 
      color_name: '', 
      material: 'cotton',
      pattern: 'solid',
      sku_suffix: '' 
    });
    setNewVariantModalVisible(true);
  };

  const saveNewVariant = () => {
    // Validate required fields
    if (!newVariantData.variant_name.trim()) {
      showMessage('Variant name is required');
      return;
    }
    if (!newVariantData.color_name.trim()) {
      showMessage('Color name is required');
      return;
    }

    // Create variant via API-flow
    VariantApiService.createProductVariant(product.id, newVariantData, (stepName: string, status: string, result: any) => {
      if (stepName === 'createProductVariant' && (status === 'SUCCESS' || status === 'Completed')) {
        const createdVariant = result?.http_response || result;
        
        // Add to local state
        setVariants(prevVariants => [...prevVariants, { ...createdVariant, stock_records: [] }]);
        setNewVariantModalVisible(false);
        showMessage(`Variant "${createdVariant.variant_name}" created successfully`);
      } else if (status === 'ERROR') {
        showMessage('Failed to create variant');
      }
    });
  };

  const saveVariant = (variantIndex: number) => {
    const variant = variants[variantIndex];
    
    if (!variant.variant_name?.trim()) {
      showMessage('Variant name is required');
      return;
    }
    
    if (variant.id) {
      // Update existing variant
      VariantApiService.updateProductVariant(product.id, variant.id, variant, (stepName: string, status: string, result: any) => {
        if (stepName === 'updateProductVariant' && (status === 'SUCCESS' || status === 'Completed')) {
          showMessage('Variant updated successfully');
          dispatch(markDirty());
          fetchProductDetails(); // Refresh variant data
        } else if (status === 'ERROR') {
          showMessage('Failed to update variant');
        }
      });
    } else {
      // Create new variant
      VariantApiService.createProductVariant(product.id, variant, (stepName: string, status: string, result: any) => {
        if (stepName === 'createProductVariant' && (status === 'SUCCESS' || status === 'Completed')) {
          const createdVariant = result?.http_response || result;
          const updatedVariants = [...variants];
          updatedVariants[variantIndex] = { ...createdVariant, stock_records: [] };
          setVariants(updatedVariants);
          showMessage('Variant saved successfully');
          dispatch(markDirty());
          fetchProductDetails(); // Refresh variant data
        } else if (status === 'ERROR') {
          showMessage('Failed to save variant');
        }
      });
    }
  };

  const removeVariant = (index: number) => {
    setSelectedVariantIndex(index);
    setSelectedStockIndex(-1); // Reset to indicate variant deletion
    setDeleteConfirmModalVisible(true);
  };

  const confirmDeleteVariant = () => {
    const variant = variants[selectedVariantIndex];
    
    if (variant?.id) {
      // Delete variant via API (this will cascade delete stock records)
      VariantApiService.deleteProductVariant(
        product.id,
        variant.id,
        (stepName: string, status: string, result: any) => {
          if (stepName === 'deleteProductVariant' && (status === 'SUCCESS' || status === 'Completed')) {
            // Remove from local state after successful API delete
            const updatedVariants = variants.filter((_, i) => i !== selectedVariantIndex);
            setVariants(updatedVariants);
            showMessage('Variant and associated stock records deleted successfully');
            dispatch(markDirty());
          } else if (status === 'ERROR') {
            showMessage('Failed to delete variant');
          }
        }
      );
    } else {
      // Remove locally if no ID (not saved to backend yet)
      const updatedVariants = variants.filter((_, i) => i !== selectedVariantIndex);
      setVariants(updatedVariants);
    }
    
    setDeleteConfirmModalVisible(false);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...(editedProduct.variants || [])];
    newVariants[index] = {...newVariants[index], [field]: value};
    setEditedProduct({...editedProduct, variants: newVariants});
  };

  const addStockRecord = (variantIndex: number) => {
    setSelectedVariantIndex(variantIndex);
    setNewStockModalVisible(true);
  };

  const handleStockRecordSave = (stockData: any) => {
    const variant = variants[selectedVariantIndex];
    
    if (!variant.id) {
      showMessage('Variant ID is missing. Cannot create stock record.');
      return;
    }
    
    // Create stock record via API
    StockApiService.createVariantStock(
      product.id,
      variant.id!,
      stockData,
      (stockStepName: string, stockStatus: string, stockResult: any) => {
        if (stockStepName === 'createVariantStock' && (stockStatus === 'SUCCESS' || stockStatus === 'Completed')) {
          // Refresh stock records from API to ensure we have complete data
          StockApiService.fetchVariantStock(product.id, variant.id!, (refreshStepName: string, refreshStatus: string, refreshResult: any) => {
            if (refreshStepName === 'fetchVariantStock' && (refreshStatus === 'SUCCESS' || refreshStatus === 'Completed')) {
              const refreshedStockData = refreshResult?.http_response || refreshResult || [];
              
              // Update the variant with refreshed stock records
              setVariants(prevVariants => {
                const updatedVariants = [...prevVariants];
                if (updatedVariants[selectedVariantIndex]) {
                  updatedVariants[selectedVariantIndex].stock_records = refreshedStockData;
                  // Fetch partner codes for display
                  if (refreshedStockData && refreshedStockData.length > 0) {
                    fetchPartnerCodes(refreshedStockData);
                  }
                }
                return updatedVariants;
              });
              
              showMessage('Stock record created successfully');
              dispatch(markDirty());
            }
          });
        } else if (stockStatus === 'ERROR') {
          showMessage('Failed to create stock record');
        }
      }
    );
  };

  const updateVariantStock = (variantIndex: number, stockIndex: number, field: string, value: any) => {
    const newVariants = [...(editedProduct.variants || [])];
    newVariants[variantIndex].stock_records[stockIndex] = {
      ...newVariants[variantIndex].stock_records[stockIndex],
      [field]: value
    };
    setEditedProduct({...editedProduct, variants: newVariants});
  };

  const saveStockRecord = (variantIndex: number, stockIndex: number) => {
    const variant = variants[variantIndex];
    const stockRecord = variant.stock_records?.[stockIndex];
    
    if (!stockRecord?.id && variant.id) {
      // Try to create new stock record via API
      StockApiService.createVariantStock(
        product.id,
        variant.id,
        stockRecord,
        (stepName: string, status: string, result: any) => {
          if (stepName === 'createVariantStock' && (status === 'SUCCESS' || status === 'Completed')) {
            const updatedVariants = [...variants];
            const createdStock = result?.http_response || result;
            if (createdStock) {
              updatedVariants[variantIndex].stock_records![stockIndex] = createdStock;
              setVariants(updatedVariants);
              showMessage('Stock record saved successfully');
            }
          } else if (status === 'ERROR') {
            // If creation fails due to duplicate, try to find and update existing record
            
            // Refresh stock records to get the existing one with ID
            StockApiService.fetchVariantStock(product.id, variant.id, (fetchStepName: string, fetchStatus: string, fetchResult: any) => {
              if (fetchStepName === 'fetchVariantStock' && (fetchStatus === 'SUCCESS' || fetchStatus === 'Completed')) {
                const stockData = fetchResult?.http_response || fetchResult || [];
                const existingRecord = stockData.find((s: any) => s.partner_id === stockRecord.partner_id);
                
                if (existingRecord) {
                  // Update the existing record with new values
                  const updatedRecord = { ...existingRecord, ...stockRecord };
                  
                  StockApiService.updateVariantStock(
                    product.id,
                    variant.id,
                    existingRecord.id,
                    updatedRecord,
                    (updateStepName: string, updateStatus: string, updateResult: any) => {
                      if (updateStepName === 'updateVariantStock' && (updateStatus === 'SUCCESS' || updateStatus === 'Completed')) {
                        // Update local state with the updated record
                        const updatedVariants = [...variants];
                        updatedVariants[variantIndex].stock_records![stockIndex] = updatedRecord;
                        setVariants(updatedVariants);
                        showMessage('Stock record updated successfully');
                        dispatch(markDirty());
                      } else {
                        showMessage('Failed to update existing stock record');
                      }
                    }
                  );
                } else {
                  showMessage('Failed to save stock record');
                }
              } else {
                showMessage('Failed to save stock record');
              }
            });
          }
        }
      );
    }
  };

  const updateStockRecord = (variantIndex: number, stockIndex: number) => {
    const variant = variants[variantIndex];
    const stockRecord = variant.stock_records?.[stockIndex];
    
    if (stockRecord?.id && variant.id) {
      // Update existing stock record via API
      StockApiService.updateVariantStock(
        product.id,
        variant.id,
        stockRecord.id,
        stockRecord,
        (stepName: string, status: string, result: any) => {
          if (stepName === 'updateVariantStock' && (status === 'SUCCESS' || status === 'Completed')) {
            showMessage('Stock record updated successfully');
            dispatch(markDirty());
          } else if (status === 'ERROR') {
            showMessage('Failed to update stock record');
          }
        }
      );
    }
  };

  const removeStockRecord = (variantIndex: number, stockIndex: number) => {
    setSelectedVariantIndex(variantIndex);
    setSelectedStockIndex(stockIndex);
    setDeleteConfirmModalVisible(true);
  };

  const confirmDeleteStockRecord = () => {
    const variant = variants[selectedVariantIndex];
    const stockRecord = variant.stock_records?.[selectedStockIndex];
    const stockId = stockRecord?.id;
    
    if (stockId && variant.id) {
      // Delete via API
      StockApiService.deleteVariantStock(
        product.id, 
        variant.id, 
        stockId, 
        (stepName: string, status: string, result: any) => {
          if (stepName === 'deleteVariantStock' && (status === 'SUCCESS' || status === 'Completed')) {
            // Remove from local state after successful API delete
            const updatedVariants = [...variants];
            updatedVariants[selectedVariantIndex].stock_records = 
              updatedVariants[selectedVariantIndex].stock_records?.filter((_, i) => i !== selectedStockIndex) || [];
            setVariants(updatedVariants);
            showMessage('Stock record deleted successfully');
            dispatch(markDirty());
          } else if (status === 'ERROR' || status === 'Failed') {
            showMessage('Failed to delete stock record');
          }
        }
      );
    } else {
      // Remove locally if no stock_id
      const updatedVariants = [...variants];
      updatedVariants[selectedVariantIndex].stock_records = 
        updatedVariants[selectedVariantIndex].stock_records?.filter((_, i) => i !== selectedStockIndex) || [];
      setVariants(updatedVariants);
      showMessage('Stock record removed');
    }
    
    setDeleteConfirmModalVisible(false);
  };

  const fetchProductDetails = async () => {
    
    try {
      // Fetch product details using API-flow
      ProductApiService.fetchProducts((stepName: string, status: string, result: any) => {
        if (stepName === 'fetchProducts' && status === 'SUCCESS') {
          const productData = result.find((p: any) => p.id === product.id);
          if (productData) {
            setEditedProduct(productData);
          }
        }
      });

      // Fetch variants with stock records using API-flow
      VariantApiService.fetchProductVariants(product.id, (stepName: string, status: string, result: any) => {
        
        if (stepName === 'fetchProductVariants' && (status === 'SUCCESS' || status === 'Completed')) {
          // Extract variants from the API response structure
          const variantData = result?.http_response || result || [];
          
          // Initialize each variant with its own stock_records array
          const variantsWithStockRecords = Array.isArray(variantData) 
            ? variantData.map(variant => ({ ...variant, stock_records: [] }))
            : [];
          
          setVariants(variantsWithStockRecords);
          
          // Fetch stock records for each variant
          if (Array.isArray(variantData) && variantData.length > 0) {
            variantData.forEach((variant: any, index: number) => {
              if (variant.id) {
                const currentVariantId = variant.id; // Capture in closure
                
                StockApiService.fetchVariantStock(product.id, currentVariantId, (stockStepName: string, stockStatus: string, stockResult: any) => {
                  if (stockStepName === 'fetchVariantStock' && (stockStatus === 'SUCCESS' || stockStatus === 'Completed')) {
                    const stockData = stockResult?.http_response || stockResult || [];
                    
                    // Update only the variant with matching ID, preserve others
                    setVariants(prevVariants => {
                      return prevVariants.map(v => {
                        if (v.id === currentVariantId) {
                          return { ...v, stock_records: Array.isArray(stockData) ? [...stockData] : [] };
                        }
                        return { ...v };
                      });
                    });
                    
                    // Fetch partner codes for display
                    if (stockData && stockData.length > 0) {
                      fetchPartnerCodes(stockData);
                    }
                  }
                });
              }
            });
          } else {
          }
        } else if (status === 'ERROR') {
        }
      });

    } catch (error) {
      console.error('Fetch error:', error);
      showMessage(strings.error);
    }
  };

  const fetchPartnerDetails = async (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      setPartnerDetails(partner);
      setPartnerModalVisible(true);
    } else {
      // Fallback to API if partner not found in Redux
      PartnerApiService.fetchPartner(partnerId, (stepName: string, status: string, result: any) => {
        if (stepName === 'fetchPartner' && (status === 'SUCCESS' || status === 'Completed')) {
          const partnerData = result?.http_response || result;
          setPartnerDetails(partnerData);
          setPartnerModalVisible(true);
        } else if (status === 'ERROR') {
          showMessage('Partner details not found');
        }
      });
    }
  };

  const savePartnerDetails = async () => {
    PartnerApiService.updatePartner(partnerDetails.id, partnerDetails, (stepName: string, status: string, result: any) => {
      if (stepName === 'updatePartner' && (status === 'SUCCESS' || status === 'Completed')) {
        showMessage('Partner details updated successfully');
        setPartnerModalVisible(false);
        // Refresh product details to get updated data
        fetchProductDetails();
      } else if (status === 'ERROR') {
        const errorResult = result?.http_response || result;
        showMessage(`Failed to update partner details`);
      }
    });
  };

  const showMessage = (message: string) => {
    setModalMessage(message);
    setMessageModalVisible(true);
  };

  const handleSave = () => {
    setConfirmModalVisible(true);
  };

  const confirmSave = async () => {
    if (loading) {
      console.log('Save already in progress, ignoring click');
      return;
    }
    
    setConfirmModalVisible(false);
    setLoading(true);

    try {
      console.log('=== PRODUCT UPDATE API CALL ===');
      console.log('Product ID:', editedProduct.id);
      
      // Clean product data to only include valid fields
      const cleanProductData = {
        title: editedProduct.title,
        description: editedProduct.description,
        sku_id: editedProduct.sku_id,
        special_features: editedProduct.special_features,
        image_urls: editedProduct.image_urls,
        category_id: editedProduct.category_id,
        status: editedProduct.status,
        enabled: editedProduct.enabled
      };
      
      console.log('Clean Product Data:', cleanProductData);
      console.log('About to start API operations...');
      
      let successCount = 0;
      // Only count the actual operations being performed: updateProduct + refreshProducts (SAGA pattern)
      let totalOperations = 2;
      
      console.log('Variants length:', variants.length);
      console.log('Total operations calculated:', totalOperations);

      // Update product using API-flow
      console.log('Calling ProductApiService.updateProduct...');
      try {
        ProductApiService.updateProduct(editedProduct.id, cleanProductData, (stepName: string, status: string, result: any) => {
          console.log('=== PRODUCT UPDATE CALLBACK TRIGGERED ===');
          console.log('Step Name:', stepName);
          console.log('Status:', status);
          console.log('Result:', result);
          
          if (stepName === 'updateProduct') {
            if (status === 'SUCCESS' || status === 'Completed') {
              console.log('Product updated successfully');
              successCount++;
              dispatch(markDirty());
            } else {
              console.log('=== PRODUCT UPDATE FAILED ===');
              console.log('Status:', status);
              console.log('Error Result:', result);
              console.log('HTTP Status:', result?.http_status_code);
              console.log('Error Message:', result?.http_status_message || result?.message);
              console.log('Full Response:', JSON.stringify(result, null, 2));
            }
            checkCompletion();
          } else if (stepName === 'refreshProducts') {
            if (status === 'SUCCESS' || status === 'Completed') {
              console.log('Products refreshed successfully');
              successCount++;
            }
            checkCompletion();
          } else {
            console.log('Unexpected step name:', stepName);
          }
        });
        console.log('ProductApiService.updateProduct call completed');
      } catch (apiError) {
        console.log('=== API SERVICE ERROR ===');
        console.log('Error calling ProductApiService:', apiError);
        setLoading(false);
        showMessage('API service error: ' + apiError.message);
        return;
      }

      // Set a timeout to handle cases where callbacks don't fire
      setTimeout(() => {
        console.log('=== TIMEOUT CHECK ===');
        console.log('Success count after 10 seconds:', successCount);
        console.log('Total operations:', totalOperations);
        if (successCount === 0) {
          console.log('No callbacks received - API service may have failed silently');
          setLoading(false);
          showMessage('API service timeout - please check network connection');
        }
      }, 10000);

      // Shorter timeout to reset loading state
      setTimeout(() => {
        if (loading) {
          console.log('Resetting loading state after 3 seconds');
          setLoading(false);
        }
      }, 3000);

      // Update/Create variants using API-flow
      variants.forEach((variant, index) => {
        if (variant.id) {
          VariantApiService.updateProductVariant(editedProduct.id, variant.id, variant, (stepName: string, status: string, result: any) => {
            if (stepName === 'updateProductVariant') {
              if (status === 'SUCCESS') successCount++;
              checkCompletion();
            }
          });
        } else {
          VariantApiService.createProductVariant(editedProduct.id, variant, (stepName: string, status: string, result: any) => {
            if (stepName === 'createProductVariant') {
              if (status === 'SUCCESS') successCount++;
              checkCompletion();
            }
          });
        }
      });

      // Update/Create stock records using API-flow
      stockRecords.forEach((stock, index) => {
        if (stock.id) {
          StockApiService.updateProductStock(editedProduct.id, stock, (stepName: string, status: string, result: any) => {
            if (stepName === 'updateProductStock') {
              if (status === 'SUCCESS') successCount++;
              checkCompletion();
            }
          });
        } else {
          StockApiService.createProductStock(editedProduct.id, stock, (stepName: string, status: string, result: any) => {
            if (stepName === 'createProductStock') {
              if (status === 'SUCCESS') successCount++;
              checkCompletion();
            }
          });
        }
      });

      // Update price records using API-flow
      priceRecords.forEach((price, index) => {
        PriceApiService.updateProductPrice(editedProduct.id, price, (stepName: string, status: string, result: any) => {
          if (stepName === 'updateProductPrice') {
            if (status === 'SUCCESS') successCount++;
            checkCompletion();
          }
        });
      });

      function checkCompletion() {
        console.log('=== CHECK COMPLETION CALLED ===');
        console.log('Success count:', successCount);
        console.log('Total operations:', totalOperations);
        
        if (successCount >= totalOperations) {
          setLoading(false);
          showMessage(strings.productUpdated);
          setTimeout(() => navigation.goBack(), 1500);
        } else {
          // Don't show failure immediately - wait for all operations
          console.log('Still waiting for operations to complete...');
        }
      }

    } catch (error) {
      console.log('=== SAVE FUNCTION ERROR ===');
      console.log('Error:', error);
      setLoading(false);
      showMessage(strings.updateFailed);
    }
  };

  const handleAddImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        ProductApiService.uploadProductImage(
          editedProduct.id, 
          result.assets[0].uri, 
          (stepName: string, status: string, result: any) => {
            if (stepName === 'uploadProductImage' && status === 'SUCCESS') {
              setEditedProduct(prev => ({
                ...prev,
                image_urls: { ...prev.image_urls, ...result }
              }));
            } else if (status === 'ERROR') {
              showMessage(strings.error);
            }
          }
        );
      } catch (error) {
        showMessage(strings.error);
      }
    }
  };

  const handleColorFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1.0,
    });

    if (!result.canceled && result.assets[0]) {
      // Simulate color extraction from image
      const extractedColor = '#' + Math.floor(Math.random()*16777215).toString(16);
      updateVariantColor(extractedColor);
      setColorModalVisible(false);
    }
  };

  const updateVariantColor = (color: string) => {
    if (selectedVariantIndex === -1) {
      // Update new variant data
      setNewVariantData({...newVariantData, color_code: color});
    } else {
      // Update existing variant
      const updatedVariants = [...variants];
      if (updatedVariants[selectedVariantIndex]) {
        updatedVariants[selectedVariantIndex].color_code = color;
        setVariants(updatedVariants);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{strings.editProduct}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loading}>
            <Text style={styles.saveButtonText}>{strings.save}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.basicInfo}</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{strings.title}</Text>
              <TextInput
                style={styles.input}
                value={editedProduct.title}
                onChangeText={(text) => setEditedProduct({...editedProduct, title: text})}
                placeholder={strings.title}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{strings.sku}</Text>
              <TextInput
                style={styles.input}
                value={editedProduct.sku_id || ''}
                onChangeText={(text) => setEditedProduct({...editedProduct, sku_id: text})}
                placeholder={strings.sku}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{strings.description}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editedProduct.description || ''}
                onChangeText={(text) => setEditedProduct({...editedProduct, description: text})}
                placeholder={strings.description}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Status</Text>
              <TouchableOpacity 
                style={styles.statusDropdown}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <Text style={styles.statusDropdownText}>
                  {editedProduct.status || 'Select Status'}
                </Text>
                <Ionicons name={showStatusDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
              </TouchableOpacity>
              
              {showStatusDropdown && (
                <View style={styles.statusDropdownMenu}>
                  {['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'DISCONTINUED'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={styles.statusDropdownItem}
                      onPress={() => {
                        setEditedProduct({...editedProduct, status: status});
                        setShowStatusDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.statusDropdownItemText,
                        editedProduct.status === status && styles.selectedStatusDropdownText
                      ]}>
                        {status}
                      </Text>
                      {editedProduct.status === status && (
                        <Ionicons name="checkmark" size={16} color="#8B5CF6" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.categories}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category: Category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    editedProduct.category_id === category.id && styles.selectedCategory
                  ]}
                  onPress={() => setEditedProduct({...editedProduct, category_id: category.id})}
                >
                  <Text style={[
                    styles.categoryText,
                    editedProduct.category_id === category.id && styles.selectedCategoryText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Variants */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{strings.variants} ({variants.length})</Text>
              <TouchableOpacity onPress={addVariant} style={styles.addButton}>
                <Ionicons name="add" size={20} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
            
            {variants.length === 0 && (
              <Text style={styles.noDataText}>No variants found. Add a variant to get started.</Text>
            )}
            
            {variants.map((variant, variantIndex) => {
              return (
              <View key={variantIndex} style={styles.variantCard}>
                {/* Variant Header */}
                <View style={styles.variantHeader}>
                  <View style={styles.variantTitleRow}>
                    <View style={[styles.colorPreview, { backgroundColor: variant.color_code || '#FF0000' }]} />
                    <View style={styles.variantTitleInfo}>
                      <Text style={styles.variantTitle}>{variant.variant_name || `Variant ${variantIndex + 1}`}</Text>
                      <Text style={styles.variantSubtitle}>{variant.color_name} • {variant.material} • {variant.pattern}</Text>
                    </View>
                  </View>
                  <View style={styles.variantActions}>
                    <TouchableOpacity 
                      style={styles.saveVariantButton}
                      onPress={() => saveVariant(variantIndex)}
                    >
                      <Ionicons name="checkmark" size={16} color="#22c55e" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeVariant(variantIndex)} style={styles.removeButton}>
                      <Ionicons name="trash" size={16} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Variant Details */}
                <View style={styles.variantDetails}>
                  <View style={styles.detailRow}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.label}>Variant Name</Text>
                      <TextInput
                        style={styles.input}
                        value={variant.variant_name || ''}
                        onChangeText={(text) => {
                          const updatedVariants = [...variants];
                          updatedVariants[variantIndex].variant_name = text;
                          setVariants(updatedVariants);
                        }}
                        placeholder="Variant Name"
                      />
                    </View>
                    
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.label}>SKU Suffix</Text>
                      <TextInput
                        style={styles.input}
                        value={variant.sku_suffix || ''}
                        onChangeText={(text) => {
                          const updatedVariants = [...variants];
                          updatedVariants[variantIndex].sku_suffix = text;
                          setVariants(updatedVariants);
                        }}
                        placeholder="SKU Suffix"
                      />
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.label}>Color Name</Text>
                      <TextInput
                        style={styles.input}
                        value={variant.color_name || ''}
                        onChangeText={(text) => {
                          const updatedVariants = [...variants];
                          updatedVariants[variantIndex].color_name = text;
                          setVariants(updatedVariants);
                        }}
                        placeholder="Color Name"
                      />
                    </View>
                    
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.label}>Color Code</Text>
                      <TouchableOpacity
                        style={styles.colorSelector}
                        onPress={() => {
                          setSelectedVariantIndex(variantIndex);
                          setColorModalVisible(true);
                        }}
                      >
                        <View style={[styles.colorPreview, { backgroundColor: variant.color_code || '#FF0000' }]} />
                        <Text style={styles.colorCodeText}>{variant.color_code || '#FF0000'}</Text>
                        <Ionicons name="chevron-down" size={16} color="#666" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                      <Text style={styles.label}>Material</Text>
                      <TextInput
                        style={styles.input}
                        value={variant.material || ''}
                        onChangeText={(text) => {
                          const updatedVariants = [...variants];
                          updatedVariants[variantIndex].material = text;
                          setVariants(updatedVariants);
                        }}
                        placeholder="cotton"
                      />
                    </View>
                    
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                      <Text style={styles.label}>Pattern</Text>
                      <TextInput
                        style={styles.input}
                        value={variant.pattern || ''}
                        onChangeText={(text) => {
                          const updatedVariants = [...variants];
                          updatedVariants[variantIndex].pattern = text;
                          setVariants(updatedVariants);
                        }}
                        placeholder="solid"
                      />
                    </View>
                  </View>
                </View>

            {/* Stock Records for this variant */}
                <View style={styles.stockSection}>
                  <View style={styles.stockHeader}>
                    <Text style={styles.stockTitle}>Stock Records ({variant.stock_records?.length || 0})</Text>
                    <TouchableOpacity onPress={() => addStockRecord(variantIndex)} style={styles.addButton}>
                      <Ionicons name="add" size={16} color="#8B5CF6" />
                    </TouchableOpacity>
                  </View>
                  
                  {variant.stock_records?.map((stock, stockIndex) => (
                    <View key={stockIndex} style={styles.stockRecord}>
                      <View style={styles.stockRecordHeader}>
                        <Text style={styles.stockRecordTitle}>
                          {(() => {
                            const partnerId = stock.partner_id;
                            const partnerCode = partnerCodes[partnerId];
                            const fallback = partnerId?.substring(0, 8) || `Stock ${stockIndex + 1}`;
                            const displayText = partnerCode || fallback;
                            return displayText;
                          })()}
                        </Text>
                        <View style={styles.stockActions}>
                          <TouchableOpacity 
                            onPress={() => fetchPartnerDetails(stock.partner_id)} 
                            style={styles.partnerInfoButton}
                          >
                            <Ionicons name="information-circle" size={16} color="#8B5CF6" />
                          </TouchableOpacity>
                          {!stock.id ? (
                            <TouchableOpacity 
                              onPress={() => saveStockRecord(variantIndex, stockIndex)} 
                              style={styles.saveStockButton}
                            >
                              <Ionicons name="checkmark" size={16} color="#22c55e" />
                            </TouchableOpacity>
                          ) : (
                            <TouchableOpacity 
                              onPress={() => updateStockRecord(variantIndex, stockIndex)} 
                              style={styles.updateStockButton}
                            >
                              <Ionicons name="save" size={16} color="#3b82f6" />
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => removeStockRecord(variantIndex, stockIndex)} style={styles.removeButton}>
                            <Ionicons name="close" size={12} color="#ff4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Available Quantity</Text>
                        <TextInput
                          style={styles.input}
                          value={stock.quantity_available?.toString() || '0'}
                          onChangeText={(text) => {
                            const updatedVariants = [...variants];
                            updatedVariants[variantIndex].stock_records![stockIndex].quantity_available = parseInt(text) || 0;
                            setVariants(updatedVariants);
                          }}
                          placeholder="Available Quantity"
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Retail Price</Text>
                        <TextInput
                          style={styles.input}
                          value={stock.retail_price?.toString() || '0'}
                          onChangeText={(text) => {
                            const updatedVariants = [...variants];
                            updatedVariants[variantIndex].stock_records![stockIndex].retail_price = parseFloat(text) || 0;
                            setVariants(updatedVariants);
                          }}
                          placeholder="Retail Price"
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Wholesale Price</Text>
                        <TextInput
                          style={styles.input}
                          value={stock.wholesale_price?.toString() || '0'}
                          onChangeText={(text) => {
                            const updatedVariants = [...variants];
                            updatedVariants[variantIndex].stock_records![stockIndex].wholesale_price = parseFloat(text) || 0;
                            setVariants(updatedVariants);
                          }}
                          placeholder="Wholesale Price"
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Currency</Text>
                        <TextInput
                          style={styles.input}
                          value={stock.currency || 'INR'}
                          onChangeText={(text) => {
                            const updatedVariants = [...variants];
                            updatedVariants[variantIndex].stock_records![stockIndex].currency = text;
                            setVariants(updatedVariants);
                          }}
                          placeholder="Currency"
                        />
                      </View>
                    </View>
                  )) || []}
                  
                  {(!variant.stock_records || variant.stock_records.length === 0) && (
                    <Text style={styles.noDataText}>No stock records. Add one to get started.</Text>
                  )}
                </View>
              </View>
              );
            })}
          </View>

          {/* Images */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.images}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {editedProduct.image_urls && Object.entries(editedProduct.image_urls).map(([key, url], index) => (
                <Image key={index} source={{ uri: url }} style={styles.productImage} />
              ))}
              <TouchableOpacity style={styles.addImageButton} onPress={handleAddImage}>
                <Ionicons name="add" size={24} color="#8B5CF6" />
                <Text style={styles.addImageText}>{strings.addImage}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Confirmation</Text>
            <Text style={styles.confirmMessage}>
              {selectedStockIndex >= 0 
                ? "Are you sure you want to delete this stock record? This action cannot be undone."
                : "Are you sure you want to delete this variant and all its stock records? This action cannot be undone."
              }
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setDeleteConfirmModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.deleteConfirmButton]}
                onPress={selectedStockIndex >= 0 ? confirmDeleteStockRecord : confirmDeleteVariant}
              >
                <Text style={[styles.confirmButtonText, styles.deleteConfirmText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>{strings.confirm}</Text>
            <Text style={styles.confirmMessage}>Save changes to product?</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.confirmButtonText}>{strings.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.saveConfirmButton]}
                onPress={confirmSave}
              >
                <Text style={[styles.confirmButtonText, styles.saveConfirmText]}>{strings.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Variant Modal */}
      <Modal
        visible={newVariantModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setNewVariantModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.newVariantModal}>
            <Text style={styles.modalTitle}>Add New Variant</Text>
            
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Basic Info Section */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Variant Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={newVariantData.variant_name}
                      onChangeText={(text) => setNewVariantData({...newVariantData, variant_name: text})}
                      placeholder="e.g., Premium Cotton"
                    />
                  </View>
                  
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>SKU Suffix *</Text>
                    <TextInput
                      style={styles.input}
                      value={newVariantData.sku_suffix}
                      onChangeText={(text) => setNewVariantData({...newVariantData, sku_suffix: text})}
                      placeholder="e.g., -PC-RED"
                    />
                  </View>
                </View>
              </View>

              {/* Color Section */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Color Details</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Color Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={newVariantData.color_name}
                    onChangeText={(text) => setNewVariantData({...newVariantData, color_name: text})}
                    placeholder="e.g., Crimson Red"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Color Code</Text>
                  <TouchableOpacity
                    style={styles.colorSelector}
                    onPress={() => {
                      setSelectedVariantIndex(-1); // Use -1 to indicate new variant
                      setColorModalVisible(true);
                    }}
                  >
                    <View style={[styles.colorPreview, { backgroundColor: newVariantData.color_code }]} />
                    <Text style={styles.colorCodeText}>{newVariantData.color_code}</Text>
                    <Ionicons name="chevron-down" size={16} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Material & Pattern Section */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>Material & Pattern</Text>
                
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Material</Text>
                    <TextInput
                      style={styles.input}
                      value={newVariantData.material}
                      onChangeText={(text) => setNewVariantData({...newVariantData, material: text})}
                      placeholder="cotton"
                    />
                  </View>
                  
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Pattern</Text>
                    <TextInput
                      style={styles.input}
                      value={newVariantData.pattern}
                      onChangeText={(text) => setNewVariantData({...newVariantData, pattern: text})}
                      placeholder="solid"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.newVariantModalButtons}>
              <TouchableOpacity
                style={styles.saveNewVariantButton}
                onPress={saveNewVariant}
              >
                <Text style={styles.saveNewVariantButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelNewVariantButton}
                onPress={() => setNewVariantModalVisible(false)}
              >
                <Text style={styles.cancelNewVariantButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Stock Record Form */}
      <StockRecordForm
        visible={newStockModalVisible}
        onClose={() => setNewStockModalVisible(false)}
        onSave={handleStockRecordSave}
      />

      {/* Partner Details Modal */}
      <Modal
        visible={partnerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPartnerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.partnerModal}>
            <Text style={styles.modalTitle}>Partner Details</Text>
            
            {partnerDetails && (
              <ScrollView style={styles.partnerInfo} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Partner Name</Text>
                  <Text style={styles.readOnlyText}>{partnerDetails.name || 'N/A'}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Partner Code</Text>
                  <Text style={styles.readOnlyText}>{partnerDetails.code || 'N/A'}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.readOnlyText}>{partnerDetails.email || 'N/A'}</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Address</Text>
                  <Text style={styles.readOnlyText}>{partnerDetails.address || 'N/A'}</Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.partnerModalButtons}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPartnerModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Message Modal */}
      <Modal
        visible={messageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMessageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.messageModal}>
            <Text style={styles.messageText}>{modalMessage}</Text>
            <TouchableOpacity
              style={styles.messageButton}
              onPress={() => setMessageModalVisible(false)}
            >
              <Text style={styles.messageButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Color Selection Modal - Rendered last to appear on top */}
      <Modal
        visible={colorModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setColorModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { zIndex: 9999 }]}>
          <View style={styles.colorModal}>
            <Text style={styles.modalTitle}>{strings.selectColor}</Text>
            
            <TouchableOpacity style={styles.cameraButton} onPress={handleColorFromCamera}>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.cameraButtonText}>{strings.colorFromCamera}</Text>
            </TouchableOpacity>

            <Text style={styles.paletteTitle}>{strings.colorFromPalette}</Text>
            <FlatList
              data={colors}
              numColumns={6}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.colorOption, { backgroundColor: item }]}
                  onPress={() => {
                    updateVariantColor(item);
                    setColorModalVisible(false);
                  }}
                />
              )}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setColorModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{strings.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 8,
  },
  recordItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  removeButton: {
    backgroundColor: '#ffe6e6',
    borderRadius: 12,
    padding: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#8B5CF6',
  },
  categoryText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  variantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  variantColor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  stockSection: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  stockRecord: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  stockRecordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockRecordTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partnerInfoButton: {
    backgroundColor: '#f0f0ff',
    borderRadius: 12,
    padding: 4,
  },
  saveStockButton: {
    backgroundColor: '#f0fff0',
    borderRadius: 12,
    padding: 4,
  },
  updateStockButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 4,
  },
  partnerModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  partnerInfo: {
    marginVertical: 16,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  partnerDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  partnerModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  savePartnerButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  savePartnerButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  closeButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  newVariantModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newVariantModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveNewVariantButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  saveNewVariantButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelNewVariantButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  cancelNewVariantButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalScrollView: {
    maxHeight: '80%',
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 16,
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  colorButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  colorButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    color: '#8B5CF6',
    fontSize: 10,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  cameraButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  cameraButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  paletteTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
  },
  confirmModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  saveConfirmButton: {
    backgroundColor: '#8B5CF6',
  },
  deleteConfirmButton: {
    backgroundColor: '#ff4444',
  },
  confirmButtonText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: '600',
  },
  saveConfirmText: {
    color: '#fff',
  },
  deleteConfirmText: {
    color: '#fff',
  },
  messageModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  messageButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
  },
  messageButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  readOnlyText: {
    fontSize: 14,
    color: '#333',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  variantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  variantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  variantTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  variantTitleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  variantSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  variantDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  variantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveVariantButton: {
    backgroundColor: '#f0fff0',
    borderRadius: 12,
    padding: 6,
  },
  colorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  colorCodeText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  statusDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  statusDropdownText: {
    fontSize: 14,
    color: '#333',
  },
  statusDropdownMenu: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusDropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  selectedStatusDropdownText: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
});
