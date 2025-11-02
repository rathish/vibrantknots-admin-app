import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, StyleSheet, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createProduct, markDirty, fetchCategories, fetchPartners, Category } from '../store/collectionsSlice';
import { 
  ProductApiService, 
  PriceApiService, 
  StockApiService, 
  VariantApiService,
  PartnerApiService 
} from '../core/api-flow/apiService';
import StockRecordForm from './StockRecordForm';
import { STRINGS } from '../constants/i18n';

interface Variant {
  id?: string;
  variant_name: string;
  color_code: string;
  color_name: string;
  sku_suffix?: string;
  material?: string;
  pattern?: string;
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

interface ProductAddScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: any) => void;
  };
}

export default function ProductAddScreen({ navigation }: ProductAddScreenProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { categories, partners } = useAppSelector((state) => state.collections);
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    sku_id: '',
    special_features: [] as string[],
    category_id: '',
    status: 'DRAFT' as const,
  });

  const [variants, setVariants] = useState<Variant[]>([]);
  const [colorModalVisible, setColorModalVisible] = useState(false);
  const [newStockModalVisible, setNewStockModalVisible] = useState(false);
  const [newVariantModalVisible, setNewVariantModalVisible] = useState(false);
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [featureInputModalVisible, setFeatureInputModalVisible] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState('');

  const colors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080',
    '#FFA500', '#FFC0CB', '#A52A2A', '#808080', '#000000', '#FFFFFF'
  ];

  useEffect(() => {
    dispatch(fetchCategories());
    if (partners.length === 0) {
      dispatch(fetchPartners());
    }
  }, [dispatch, partners.length]);

  // Fetch partner codes for display using Redux partners
  const fetchPartnerCodes = (stockRecords: any[]) => {
    const partnerIds = [...new Set(stockRecords.map(stock => stock.partner_id))];
    
    setPartnerCodes(prevCodes => {
      const codes = { ...prevCodes };
      
      partnerIds.forEach(partnerId => {
        if (!codes[partnerId]) {
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

  const showMessage = (message: string) => {
    setModalMessage(message);
    setMessageModalVisible(true);
  };

  const addVariant = () => {
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
    if (!newVariantData.variant_name.trim()) {
      showMessage('Variant name is required');
      return;
    }
    if (!newVariantData.color_name.trim()) {
      showMessage('Color name is required');
      return;
    }

    const newVariant: Variant = {
      ...newVariantData,
      stock_records: []
    };
    
    setVariants(prevVariants => [...prevVariants, newVariant]);
    setNewVariantModalVisible(false);
    showMessage(`Variant "${newVariantData.variant_name}" added successfully`);
  };

  const removeVariant = (index: number) => {
    setSelectedVariantIndex(index);
    setSelectedStockIndex(-1);
    setDeleteConfirmModalVisible(true);
  };

  const confirmDeleteVariant = () => {
    const updatedVariants = variants.filter((_, i) => i !== selectedVariantIndex);
    setVariants(updatedVariants);
    setDeleteConfirmModalVisible(false);
    showMessage('Variant removed successfully');
  };

  const addStockRecord = (variantIndex: number) => {
    setSelectedVariantIndex(variantIndex);
    setNewStockModalVisible(true);
  };

  const handleStockRecordSave = (stockData: any) => {
    const updatedVariants = [...variants];
    if (!updatedVariants[selectedVariantIndex].stock_records) {
      updatedVariants[selectedVariantIndex].stock_records = [];
    }
    updatedVariants[selectedVariantIndex].stock_records!.push(stockData);
    setVariants(updatedVariants);
    
    // Fetch partner codes for display
    if (stockData) {
      fetchPartnerCodes([stockData]);
    }
    
    showMessage('Stock record added successfully');
  };

  const removeStockRecord = (variantIndex: number, stockIndex: number) => {
    setSelectedVariantIndex(variantIndex);
    setSelectedStockIndex(stockIndex);
    setDeleteConfirmModalVisible(true);
  };

  const confirmDeleteStockRecord = () => {
    const updatedVariants = [...variants];
    updatedVariants[selectedVariantIndex].stock_records = 
      updatedVariants[selectedVariantIndex].stock_records?.filter((_, i) => i !== selectedStockIndex) || [];
    setVariants(updatedVariants);
    setDeleteConfirmModalVisible(false);
    showMessage('Stock record removed successfully');
  };

  const fetchPartnerDetails = async (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      setPartnerDetails(partner);
      setPartnerModalVisible(true);
    } else {
      showMessage('Partner details not found');
    }
  };

  const updateVariantColor = (color: string) => {
    if (selectedVariantIndex === -1) {
      setNewVariantData({...newVariantData, color_code: color});
    } else {
      const updatedVariants = [...variants];
      if (updatedVariants[selectedVariantIndex]) {
        updatedVariants[selectedVariantIndex].color_code = color;
        setVariants(updatedVariants);
      }
    }
  };

  const addFeature = () => {
    setNewFeatureText('');
    setFeatureInputModalVisible(true);
  };

  const saveFeature = () => {
    if (newFeatureText.trim()) {
      setNewProduct({
        ...newProduct, 
        special_features: [...newProduct.special_features, newFeatureText.trim()]
      });
      setFeatureInputModalVisible(false);
      setNewFeatureText('');
    }
  };

  const handleSave = () => {
    setConfirmModalVisible(true);
  };

  const confirmSave = async () => {
    if (loading) return;
    
    setConfirmModalVisible(false);
    setLoading(true);

    try {
      if (!newProduct.title.trim()) {
        showMessage('Product title is required');
        setLoading(false);
        return;
      }

      // Format product data to match API structure
      const productData = {
        title: newProduct.title,
        description: newProduct.description || null,
        sku_id: newProduct.sku_id || null,
        special_features: newProduct.special_features || [],
        image_urls: {},
        category_id: newProduct.category_id || null,
        status: 'DRAFT',
        created_by: 'frontend_user'
      };

      // Create product using API-flow
      ProductApiService.createProduct(productData, async (stepName: string, status: string, result: any) => {
        if (stepName === 'createProduct' && (status === 'SUCCESS' || status === 'Completed')) {
          const createdProduct = result?.http_response || result;
          const productId = createdProduct?.id;
          
          if (productId && variants.length > 0) {
            // Create variants and their stock records
            let variantCount = 0;
            const totalVariants = variants.length;
            
            variants.forEach((variant, index) => {
              VariantApiService.createProductVariant(productId, variant, (variantStepName: string, variantStatus: string, variantResult: any) => {
                if (variantStepName === 'createProductVariant' && (variantStatus === 'SUCCESS' || variantStatus === 'Completed')) {
                  const createdVariant = variantResult?.http_response || variantResult;
                  
                  // Create stock records for this variant
                  if (variant.stock_records && variant.stock_records.length > 0 && createdVariant?.id) {
                    variant.stock_records.forEach((stockRecord) => {
                      StockApiService.createVariantStock(
                        productId,
                        createdVariant.id,
                        stockRecord,
                        (stockStepName: string, stockStatus: string, stockResult: any) => {
                          if (stockStepName === 'createVariantStock' && (stockStatus === 'SUCCESS' || stockStatus === 'Completed')) {
                            // Stock record created successfully
                          }
                        }
                      );
                    });
                  }
                  
                  variantCount++;
                  if (variantCount === totalVariants) {
                    // All variants created
                    setLoading(false);
                    dispatch(markDirty());
                    showMessage('Product created successfully with variants and stock records');
                    setTimeout(() => navigation.goBack(), 1500);
                  }
                } else if (variantStatus === 'ERROR') {
                  setLoading(false);
                  showMessage('Failed to create variant');
                }
              });
            });
          } else {
            // No variants, just complete
            setLoading(false);
            dispatch(markDirty());
            showMessage('Product created successfully');
            setTimeout(() => navigation.goBack(), 1500);
          }
        } else if (status === 'ERROR') {
          setLoading(false);
          showMessage('Failed to create product');
        }
      });

    } catch (error) {
      setLoading(false);
      showMessage('Failed to create product');
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="product-add-screen">
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Product</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loading} testID="save-product-button">
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                value={newProduct.title}
                onChangeText={(text) => setNewProduct({...newProduct, title: text})}
                placeholder="Product title"
                testID="product-title-input"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SKU ID</Text>
              <TextInput
                style={styles.input}
                value={newProduct.sku_id}
                onChangeText={(text) => setNewProduct({...newProduct, sku_id: text})}
                placeholder="SKU identifier"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newProduct.description}
                onChangeText={(text) => setNewProduct({...newProduct, description: text})}
                placeholder="Product description"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Special Features</Text>
              <View style={styles.featuresContainer}>
                {newProduct.special_features.map((feature, index) => (
                  <View key={index} style={styles.featureChip}>
                    <Text style={styles.featureText}>{feature}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const newFeatures = newProduct.special_features.filter((_, i) => i !== index);
                        setNewProduct({...newProduct, special_features: newFeatures});
                      }}
                      style={styles.removeFeatureButton}
                    >
                      <Ionicons name="close" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addFeatureButton}
                  onPress={addFeature}
                >
                  <Ionicons name="add" size={16} color="#8B5CF6" />
                  <Text style={styles.addFeatureText}>Add Feature</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((category: Category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryChip,
                    newProduct.category_id === category.id && styles.selectedCategory
                  ]}
                  onPress={() => setNewProduct({...newProduct, category_id: category.id})}
                >
                  <Text style={[
                    styles.categoryText,
                    newProduct.category_id === category.id && styles.selectedCategoryText
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

        </ScrollView>

        {/* Confirmation Modal */}
        <Modal
          visible={confirmModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setConfirmModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Create Product</Text>
              <Text style={styles.confirmMessage}>Create new product with variants and stock records?</Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => setConfirmModalVisible(false)}
                >
                  <Text style={styles.confirmButtonText}>{STRINGS.CANCEL}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.saveConfirmButton]}
                  onPress={confirmSave}
                >
                  <Text style={[styles.confirmButtonText, styles.saveConfirmText]}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
                  ? "Are you sure you want to remove this stock record?"
                  : "Are you sure you want to remove this variant and all its stock records?"
                }
              </Text>
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => setDeleteConfirmModalVisible(false)}
                >
                  <Text style={styles.confirmButtonText}>{STRINGS.CANCEL}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.deleteConfirmButton]}
                  onPress={selectedStockIndex >= 0 ? confirmDeleteStockRecord : confirmDeleteVariant}
                >
                  <Text style={[styles.confirmButtonText, styles.deleteConfirmText]}>{STRINGS.DELETE}</Text>
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
                        setSelectedVariantIndex(-1);
                        setColorModalVisible(true);
                      }}
                    >
                      <View style={[styles.colorPreview, { backgroundColor: newVariantData.color_code }]} />
                      <Text style={styles.colorCodeText}>{newVariantData.color_code}</Text>
                      <Ionicons name="chevron-down" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

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
                  <Text style={styles.cancelNewVariantButtonText}>{STRINGS.CANCEL}</Text>
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

        {/* Feature Input Modal */}
        <Modal
          visible={featureInputModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setFeatureInputModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Add Feature</Text>
              <TextInput
                style={styles.input}
                value={newFeatureText}
                onChangeText={setNewFeatureText}
                placeholder="Enter feature name"
                autoFocus
              />
              <View style={styles.confirmButtons}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => setFeatureInputModalVisible(false)}
                >
                  <Text style={styles.confirmButtonText}>{STRINGS.CANCEL}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.saveConfirmButton]}
                  onPress={saveFeature}
                >
                  <Text style={[styles.confirmButtonText, styles.saveConfirmText]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Color Selection Modal */}
        <Modal
          visible={colorModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setColorModalVisible(false)}
        >
          <View style={[styles.modalOverlay, { zIndex: 9999 }]}>
            <View style={styles.colorModal}>
              <Text style={styles.modalTitle}>Select Color</Text>
              
              <Text style={styles.paletteTitle}>Choose from palette</Text>
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
                <Text style={styles.cancelButtonText}>{STRINGS.CANCEL}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 16,
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
  removeButton: {
    backgroundColor: '#ffe6e6',
    borderRadius: 12,
    padding: 4,
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
  newVariantModal: {
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
  modalScrollView: {
    maxHeight: '80%',
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  partnerModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
  readOnlyText: {
    fontSize: 14,
    color: '#333',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  colorModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
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
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
  removeFeatureButton: {
    padding: 2,
  },
  addFeatureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f0ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
    gap: 4,
  },
  addFeatureText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
});
