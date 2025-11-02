import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Modal, Image, Alert, Share, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts, fetchCategories, fetchPartners, createProduct, updateProduct, deleteProduct, uploadProductImage, addImageToProduct, markDirty, updateProductStatus, Product, setProducts } from '../store/collectionsSlice';
import { STRINGS, formatString } from '../constants/i18n';
import { ProductApiService } from '../core/api-flow/apiService';

interface NewProduct {
  name: string;
  category: string;
  sku: string;
  price: string;
  stock: string;
}

interface NavigationProps {
  navigate: (screen: string) => void;
}

interface CollectionsScreenProps {
  navigation: NavigationProps;
}

export default function CollectionsScreen({ navigation }: CollectionsScreenProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { products, categories, loading, error, isDirty } = useAppSelector((state) => state.collections);
  
  // Currency symbol mapping
  const getCurrencySymbol = (currency: string) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'CNY': '¥',
      'CAD': 'C$',
      'AUD': 'A$'
    };
    return symbols[currency] || currency;
  };
  
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState<boolean>(false);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [confirmAction, setConfirmAction] = useState<{product: Product, action: string} | null>(null);
  const [bulkMode, setBulkMode] = useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showSortModal, setShowSortModal] = useState<boolean>(false);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
    dispatch(fetchPartners());
  }, [dispatch]);

  // Check for dirty flag and refresh when needed
  useEffect(() => {
    if (isDirty) {
      dispatch(fetchProducts());
    }
  }, [isDirty, dispatch]);
  const [newProduct, setNewProduct] = useState<NewProduct>({ 
    name: '', 
    category: 'Shirts', 
    sku: '', 
    price: '', 
    stock: '' 
  });

  // Debug logging

  // Use only backend data
  const displayProducts = products || [];
  const displayCategories = categories && categories.length > 0 ? categories : [];

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      try {
        await dispatch(deleteProduct(productToDelete.id)).unwrap();
        setShowDeleteModal(false);
        setProductToDelete(null);
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    // Convert new API structure to legacy format for ProductEditScreen
    const legacyProduct = {
      ...product,
      id: product.product_id,
      image_urls: product.images?.reduce((acc, url, index) => {
        acc[`image_${index}`] = url;
        return acc;
      }, {} as Record<string, string>) || {}
    };
    navigation.navigate('ProductEdit', legacyProduct);
  };

  const handleDiscontinueProduct = async (product: Product) => {
    const isDiscontinued = product.status === 'DISCONTINUED';
    const action = isDiscontinued ? 'Publish' : 'Discontinue';
    
    setConfirmAction({ product, action });
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    
    const { product, action } = confirmAction;
    const productId = product.product_id || product.id;
    const isDiscontinued = product.status === 'DISCONTINUED';
    const newStatus = isDiscontinued ? 'PUBLISHED' : 'DISCONTINUED';
    
    try {
      ProductApiService.updateProductStatus(productId, newStatus, (stepName: string, status: string, result: any) => {
        if (status === "Completed") {
          setTimeout(() => {
            dispatch(updateProductStatus({ 
              productId: productId, 
              status: newStatus
            }));
          }, 100);
          Alert.alert('Success', `Product ${action.toLowerCase()}d successfully`);
        } else if (status === "Failed") {
          Alert.alert('Error', `Failed to ${action.toLowerCase()} product`);
        }
      });
    } catch (error) {
      console.error('Exception in executeAction:', error);
      Alert.alert('Error', `Failed to ${action.toLowerCase()} product`);
    }
    
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const handleShareProduct = async (product: Product) => {
    try {
      const productTitle = product.title || product.name || 'Product';
      const currency = product.price_table?.currency || '₹';
      let priceInfo = '';
      
      if (product.price_table?.retail_price && product.price_table?.wholesale_price) {
        priceInfo = `Retail: ${currency} ${product.price_table.retail_price} | Wholesale: ${currency} ${product.price_table.wholesale_price}`;
      } else if (product.price_table?.retail_price) {
        priceInfo = `Price: ${currency} ${product.price_table.retail_price}`;
      } else if (product.price_table?.wholesale_price) {
        priceInfo = `Price: ${currency} ${product.price_table.wholesale_price}`;
      } else if (product.price) {
        priceInfo = `Price: ${product.price}`;
      }
      
      await Share.share({
        message: `Check out ${productTitle} - ${priceInfo}\nSKU: ${product.sku}`,
        title: productTitle,
      });
    } catch (error) {
    }
  };

  const handleAddImage = async (productId: string) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        // Convert URI to File for upload
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        
        await dispatch(uploadProductImage({ productId, imageFile: file })).unwrap();
        dispatch(markDirty());
        Alert.alert('Success', 'Image uploaded successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image');
      }
    }
  };

  const toggleProductSelection = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleSelectAll = () => {
    const filteredIds = filteredProducts.map(p => p.product_id || p.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every(id => selectedProducts.has(id));
    
    if (allSelected) {
      // Remove all filtered products from selection
      const newSelected = new Set(selectedProducts);
      filteredIds.forEach(id => newSelected.delete(id));
      setSelectedProducts(newSelected);
    } else {
      // Add all filtered products to selection
      const newSelected = new Set(selectedProducts);
      filteredIds.forEach(id => newSelected.add(id));
      setSelectedProducts(newSelected);
    }
  };

  const clearSelection = () => {
    setSelectedProducts(new Set());
    setBulkMode(false);
  };

  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    try {
      for (const productId of selectedProducts) {
        await dispatch(deleteProduct(productId)).unwrap();
      }
      setShowBulkDeleteModal(false);
      clearSelection();
    } catch (error) {
      // Error handled silently
    }
  };

  const saveEditedProduct = async () => {
    if (editingProduct) {
      try {
        await dispatch(updateProduct(editingProduct)).unwrap();
        setShowEditModal(false);
        setEditingProduct(null);
      } catch (error) {
        Alert.alert('Error', 'Failed to update product');
      }
    }
  };

  const filteredProducts = (displayProducts || []).filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category_id === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;
    const productTitle = product.title || '';
    const productDescription = product.description || '';
    const matchesSearch = searchQuery === '' || 
      productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      productDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = (a.title || a.name || '').toLowerCase();
        bValue = (b.title || b.name || '').toLowerCase();
        break;
      case 'price':
        aValue = a.stock_records?.[0]?.retail_price || 0;
        bValue = b.stock_records?.[0]?.retail_price || 0;
        break;
      case 'stock':
        aValue = a.stock_records?.[0]?.quantity_available || 0;
        bValue = b.stock_records?.[0]?.quantity_available || 0;
        break;
      case 'category':
        const aCat = categories.find(cat => cat.id === a.category_id)?.name || '';
        const bCat = categories.find(cat => cat.id === b.category_id)?.name || '';
        aValue = aCat.toLowerCase();
        bValue = bCat.toLowerCase();
        break;
      case 'status':
        aValue = (a.status || '').toLowerCase();
        bValue = (b.status || '').toLowerCase();
        break;
      default:
        aValue = (a.title || a.name || '').toLowerCase();
        bValue = (b.title || b.name || '').toLowerCase();
    }
    
    if (sortBy === 'price' || sortBy === 'stock') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    }
  });

  const addNewProduct = async (): Promise<void> => {
    if (newProduct.name && newProduct.sku && newProduct.price) {
      try {
        const productData = { 
          ...newProduct, 
          stock: parseInt(newProduct.stock) || 0,
          images: ['https://via.placeholder.com/150x150/8B5CF6/white?text=New']
        };
        await dispatch(createProduct(productData)).unwrap();
        setNewProduct({ name: '', category: 'Shirts', sku: '', price: '', stock: '' });
        setShowAddModal(false);
      } catch (error) {
        Alert.alert('Error', 'Failed to create product');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="collections-screen">
      <View style={styles.header}>
        {!showSearch ? (
          <>
            <Text style={styles.title}>{STRINGS.COLLECTIONS}</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => setShowSearch(true)}
                testID="search-button"
              >
                <Ionicons name="search" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.bulkButton, bulkMode && styles.bulkButtonActive]}
                onPress={() => setBulkMode(!bulkMode)}
              >
                <Ionicons name="checkmark-circle" size={24} color={bulkMode ? "white" : "#666"} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={() => setShowSortModal(true)}
              >
                <Ionicons name="funnel" size={24} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => navigation.navigate('ProductAdd')}
                testID="add-product-button"
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              testID="search-input"
            />
            <TouchableOpacity 
              style={styles.closeSearchButton}
              onPress={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
              testID="close-search-button"
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.dropdownContainer}>
        <View style={styles.dropdownRow}>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            testID="category-dropdown"
          >
            <Text style={styles.dropdownText}>
              {selectedCategory === 'All' ? 'All' : categories.find(cat => cat.id === selectedCategory)?.name || selectedCategory} ({selectedCategory === 'All' ? (displayProducts || []).length : (displayProducts || []).filter(p => p.category_id === selectedCategory).length})
            </Text>
            <Ionicons name={showCategoryDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.categoryManageButton}
            onPress={() => navigation.navigate('CategoryManagement')}
          >
            <Ionicons name="settings" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
        
        {showCategoryDropdown && (
          <View style={styles.dropdownMenu} testID="dropdown-menu">
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedCategory('All');
                setShowCategoryDropdown(false);
              }}
              testID="category-option"
            >
              <Text style={styles.dropdownItemText}>All</Text>
              <Text style={styles.dropdownItemCount}>{(displayProducts || []).length}</Text>
            </TouchableOpacity>
            {displayCategories && displayCategories.map((category) => {
              const categoryName = typeof category === 'string' ? category : category.name;
              const categoryId = typeof category === 'string' ? category : category.id;
              const count = (displayProducts || []).filter(p => p.category_id === categoryId).length;
              return (
                <TouchableOpacity
                  key={categoryId}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedCategory(categoryId);
                    setShowCategoryDropdown(false);
                  }}
                  testID="category-option"
                >
                  <Text style={styles.dropdownItemText}>{categoryName}</Text>
                  <Text style={styles.dropdownItemCount}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {bulkMode && (
        <View style={styles.bulkActionsBar}>
          <View style={styles.bulkInfo}>
            <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
              <Text style={styles.selectAllText}>
                {(() => {
                  const filteredIds = filteredProducts.map(p => p.product_id || p.id);
                  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedProducts.has(id));
                  return allFilteredSelected ? STRINGS.UNSELECT_ALL : STRINGS.SELECT_ALL;
                })()}
              </Text>
            </TouchableOpacity>
            <Text style={styles.selectedCount}>{selectedProducts.size} {STRINGS.SELECTED}</Text>
          </View>
          <View style={styles.bulkActions}>
            <TouchableOpacity onPress={handleBulkDelete} style={styles.bulkDeleteButton}>
              <Ionicons name="trash" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={clearSelection} style={styles.bulkCancelButton}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingState} testID="loading-indicator">
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorState} testID="error-state">
            <Text style={styles.errorTitle}>Error Loading Products</Text>
            <Text style={styles.errorText} testID="error-message">{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => {
                dispatch(fetchProducts());
                dispatch(fetchCategories());
              }}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : displayProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/200x200/E5E7EB/9CA3AF?text=No+Products' }}
              style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? `No products match "${searchQuery}"` : `No products in ${selectedCategory} category`}
            </Text>
          </View>
        ) : (
          filteredProducts && filteredProducts.map((product) => {
            // Debug: Log product structure
            
            return (
            <View key={`${product.product_id || product.id}-${product.status}`} style={[styles.productCard, product.status === 'DISCONTINUED' && styles.discontinuedCard]} testID="product-card" className={product.status === 'DISCONTINUED' ? 'discontinued' : ''}>
              {bulkMode && (
                <TouchableOpacity 
                  style={styles.checkbox}
                  onPress={() => toggleProductSelection(product.product_id || product.id)}
                >
                  <Ionicons 
                    name={selectedProducts.has(product.product_id || product.id) ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={selectedProducts.has(product.product_id || product.id) ? "#8B5CF6" : "#ccc"} 
                  />
                </TouchableOpacity>
              )}
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View style={styles.badgeRow} testID="badge-row">
                    <Text style={[styles.stockBadge, product.total_stock === 0 && styles.lowStockBadge]} testID="stock-badge">
                      {product.total_stock === 0 ? 'Out of Stock' : `Stock: ${product.total_stock}`}
                    </Text>
                    <Text style={[styles.statusBadge, styles[`status_${product.status?.toLowerCase()}`]]}>
                      {product.status}
                    </Text>
                    <Text style={styles.categoryBadge} testID="category-badge">
                      {categories.find(cat => cat.id === product.category_id)?.name || STRINGS.UNCATEGORIZED}
                    </Text>
                  </View>
                  <Text style={[styles.productName, product.status === 'DISCONTINUED' && styles.discontinuedText]} testID="product-title">{product.title}</Text>
                  {product.description && (
                    <Text style={styles.productDescription} testID="product-description">{product.description}</Text>
                  )}
                  {product.variant_colors && product.variant_colors.length > 0 && (
                    <View style={styles.variantSection}>
                      <Text style={styles.variantLabel}>Available Colors:</Text>
                      <View style={styles.variantColors} testID="variant-colors">
                        {product.variant_colors.map((color, index) => (
                          <View 
                            key={index} 
                            style={[styles.colorCircle, { backgroundColor: color }]}
                            testID="variant-colors"
                          />
                        ))}
                      </View>
                    </View>
                  )}
                  <View style={styles.headerRow}>
                    {product.status === 'DISCONTINUED' && (
                      <Text style={styles.discontinuedTag}>DISCONTINUED</Text>
                    )}
                  </View>
                </View>
                {!bulkMode && (
                  <View style={styles.priceContainer} testID="price-container">
                    <Text style={styles.retailPrice} testID="retail-price">
                      ₹{product.min_retail_price?.toFixed(2)}
                    </Text>
                    <Text style={styles.wholesalePrice}>
                      From ₹{product.min_wholesale_price?.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
                  {product.images && product.images.length > 0 ? 
                    product.images.map((imageUrl, index) => (
                      <TouchableOpacity key={index} style={styles.imageContainer} onPress={() => Alert.alert('Image', imageUrl)}>
                        <Image 
                          source={{ uri: imageUrl }} 
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    )) : (
                      <View style={styles.noImageContainer}>
                        <Ionicons name="image-outline" size={40} color="#ccc" />
                        <Text style={styles.noImageText}>No images</Text>
                      </View>
                    )}
                </ScrollView>
              </View>

              <View style={styles.cardFooter}>
                {product.status === 'DISCONTINUED' ? (
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(product)} testID="delete-button">
                    <Ionicons name="trash" size={18} color="#EF4444" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.footerButton} onPress={() => handleEditProduct(product)} testID="edit-button">
                    <Ionicons name="pencil" size={18} color="#8B5CF6" />
                    <Text style={styles.footerButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[
                    styles.footerButton, 
                    product.status !== 'PUBLISHED' && styles.disabledButton
                  ]} 
                  onPress={() => product.status === 'PUBLISHED' && handleShareProduct(product)}
                >
                  <Ionicons name="share-social" size={18} color={product.status !== 'PUBLISHED' ? "#ccc" : "#10B981"} />
                  <Text style={[styles.footerButtonText, { color: product.status !== 'PUBLISHED' ? "#ccc" : '#10B981' }]}>Share</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.footerButton} onPress={() => handleDiscontinueProduct(product)} testID="discontinue-button">
                  <Ionicons 
                    name={product.status === 'DISCONTINUED' ? "checkmark-circle" : "close-circle"} 
                    size={18} 
                    color={product.status === 'DISCONTINUED' ? "#10B981" : "#EF4444"} 
                  />
                  <Text style={[styles.footerButtonText, { color: product.status === 'DISCONTINUED' ? "#10B981" : '#EF4444' }]}>
                    {product.status === 'DISCONTINUED' ? 'Publish' : 'Discontinue'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New SKU</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="input"
              placeholder="Product Name"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct({...newProduct, name: text})}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories && categories.map((cat) => {
                  const categoryName = typeof cat === 'string' ? cat : cat.name;
                  return (
                    <TouchableOpacity
                      key={categoryName}
                      className={`categoryOption ${newProduct.category === categoryName ? 'selectedOption' : ''}`}
                      onPress={() => setNewProduct({...newProduct, category: categoryName})}
                    >
                      <Text className={`optionText ${newProduct.category === categoryName ? 'selectedOptionText' : ''}`}>
                        {categoryName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TextInput
              className="input"
              placeholder="SKU Code"
              value={newProduct.sku}
              onChangeText={(text) => setNewProduct({...newProduct, sku: text})}
            />

            <TextInput
              className="input"
              placeholder="Price (e.g., $29.99)"
              value={newProduct.price}
              onChangeText={(text) => setNewProduct({...newProduct, price: text})}
            />

            <TextInput
              className="input"
              placeholder="Stock Quantity"
              value={newProduct.stock}
              onChangeText={(text) => setNewProduct({...newProduct, stock: text})}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveButton} onPress={addNewProduct}>
              <Text style={styles.saveButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {editingProduct && (
              <>
                <TextInput
                  className="input"
                  placeholder="Product Name"
                  value={editingProduct.name}
                  onChangeText={(text) => setEditingProduct({...editingProduct, name: text})}
                />

                <TextInput
                  className="input"
                  placeholder="SKU Code"
                  value={editingProduct.sku}
                  onChangeText={(text) => setEditingProduct({...editingProduct, sku: text})}
                />

                <TextInput
                  className="input"
                  placeholder="Price"
                  value={editingProduct.price}
                  onChangeText={(text) => setEditingProduct({...editingProduct, price: text})}
                />

                <TextInput
                  className="input"
                  placeholder="Stock Quantity"
                  value={editingProduct.stock.toString()}
                  onChangeText={(text) => setEditingProduct({...editingProduct, stock: parseInt(text) || 0})}
                  keyboardType="numeric"
                />

                <TouchableOpacity style={styles.saveButton} onPress={saveEditedProduct}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New SKU</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct({...newProduct, name: text})}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories && categories.map((cat) => {
                  const categoryName = typeof cat === 'string' ? cat : cat.name;
                  return (
                    <TouchableOpacity
                      key={categoryName}
                      style={[styles.categoryOption, newProduct.category === categoryName && styles.selectedOption]}
                      onPress={() => setNewProduct({...newProduct, category: categoryName})}
                    >
                      <Text style={[styles.optionText, newProduct.category === categoryName && styles.selectedOptionText]}>
                        {categoryName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TextInput
              style={styles.input}
              placeholder="SKU Code"
              value={newProduct.sku}
              onChangeText={(text) => setNewProduct({...newProduct, sku: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Price (e.g., $29.99)"
              value={newProduct.price}
              onChangeText={(text) => setNewProduct({...newProduct, price: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Stock Quantity"
              value={newProduct.stock}
              onChangeText={(text) => setNewProduct({...newProduct, stock: text})}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.saveButton} onPress={addNewProduct}>
              <Text style={styles.saveButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {editingProduct && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Product Name"
                  value={editingProduct.name}
                  onChangeText={(text) => setEditingProduct({...editingProduct, name: text})}
                />

                <TextInput
                  style={styles.input}
                  placeholder="SKU Code"
                  value={editingProduct.sku}
                  onChangeText={(text) => setEditingProduct({...editingProduct, sku: text})}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Price"
                  value={editingProduct.price}
                  onChangeText={(text) => setEditingProduct({...editingProduct, price: text})}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Stock Quantity"
                  value={editingProduct.stock.toString()}
                  onChangeText={(text) => setEditingProduct({...editingProduct, stock: parseInt(text) || 0})}
                  keyboardType="numeric"
                />

                <TouchableOpacity style={styles.saveButton} onPress={saveEditedProduct}>
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent animationType="fade" testID="confirm-modal">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle} testID="confirm-title">
              {confirmAction?.action} Product
            </Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to {confirmAction?.action.toLowerCase()} "{confirmAction?.product.title}"?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.actionButton]} 
                onPress={executeAction}
                testID="confirm-action-button"
              >
                <Text style={styles.actionButtonText}>{confirmAction?.action}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade" testID="delete-modal">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>{STRINGS.DELETE_PRODUCT}</Text>
            <Text style={styles.confirmMessage}>
              {formatString(STRINGS.DELETE_PRODUCT_CONFIRMATION, {product: productToDelete?.title || ''})} "{productToDelete?.title}"? {STRINGS.CANNOT_UNDO}
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                testID="cancel-delete-button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.deleteConfirmButton]} 
                onPress={confirmDelete}
                testID="confirm-delete-button"
              >
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bulk Delete Confirmation Modal */}
      <Modal visible={showBulkDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>{STRINGS.DELETE_PRODUCTS}</Text>
            <Text style={styles.confirmMessage}>
              {formatString(STRINGS.DELETE_PRODUCTS_CONFIRMATION, {count: selectedProducts.size})}
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.cancelButton]} 
                onPress={() => setShowBulkDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>{STRINGS.CANCEL}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, styles.deleteConfirmButton]} 
                onPress={confirmBulkDelete}
              >
                <Text style={styles.deleteConfirmButtonText}>{STRINGS.DELETE}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sortModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort Products</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.sortLabel}>Sort by:</Text>
              {['name', 'price', 'stock', 'category', 'status'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.sortOption, sortBy === option && styles.selectedSortOption]}
                  onPress={() => setSortBy(option)}
                >
                  <Text style={[styles.sortOptionText, sortBy === option && styles.selectedSortText]}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                  {sortBy === option && <Ionicons name="checkmark" size={20} color="#8B5CF6" />}
                </TouchableOpacity>
              ))}
              
              <Text style={styles.sortLabel}>Order:</Text>
              {[{key: 'asc', label: 'Ascending'}, {key: 'desc', label: 'Descending'}].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.sortOption, sortOrder === option.key && styles.selectedSortOption]}
                  onPress={() => setSortOrder(option.key as 'asc' | 'desc')}
                >
                  <Text style={[styles.sortOptionText, sortOrder === option.key && styles.selectedSortText]}>
                    {option.label}
                  </Text>
                  {sortOrder === option.key && <Ionicons name="checkmark" size={20} color="#8B5CF6" />}
                </TouchableOpacity>
              ))}

              <Text style={styles.sortLabel}>Filter by Status:</Text>
              {['All', 'DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'DISCONTINUED'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.sortOption, selectedStatus === status && styles.selectedSortOption]}
                  onPress={() => setSelectedStatus(status)}
                >
                  <Text style={[styles.sortOptionText, selectedStatus === status && styles.selectedSortText]}>
                    {status}
                  </Text>
                  {selectedStatus === status && <Ionicons name="checkmark" size={20} color="#8B5CF6" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Design System Variables
const colors = {
  primary: '#FDC83C',
  primaryDark: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  textPrimary: '#69480F',
  gray50: '#F8FAFC',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray500: '#6B7280',
  gray600: '#374151',
  gray700: '#1F2937',
  white: '#FFFFFF',
  black: '#000000',
};

const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  10: 40,
  20: 80,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
    paddingVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  searchButton: {
    width: spacing[10],
    height: spacing[10],
    borderRadius: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: spacing[10],
    height: spacing[10],
    borderRadius: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: spacing[5],
    paddingHorizontal: spacing[4],
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing[2],
    color: colors.gray600,
  },
  closeSearchButton: {
    padding: spacing[1],
  },
  dropdownContainer: {
    marginHorizontal: spacing[5],
    marginBottom: spacing[5],
    position: 'relative',
    zIndex: 1000,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  categoryManageButton: {
    padding: spacing[2],
    backgroundColor: colors.gray50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  bulkButton: {
    width: spacing[10],
    height: spacing[10],
    borderRadius: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  bulkButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  sortButton: {
    width: spacing[10],
    height: spacing[10],
    borderRadius: spacing[5],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
  },
  bulkActionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  bulkInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  selectAllButton: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
  },
  selectAllText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedCount: {
    fontSize: 14,
    color: colors.gray600,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  bulkDeleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
  },
  bulkCancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray200,
  },
  checkbox: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    zIndex: 10,
  },
  dropdown: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    marginTop: spacing[1],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.gray600,
  },
  dropdownItemCount: {
    fontSize: 12,
    color: colors.gray500,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing[5],
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing[4],
    marginBottom: spacing[4],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[4],
  },
  headerLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing[1],
  },
  productSku: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: spacing[2],
  },
  productDescription: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: spacing[1],
    fontStyle: 'italic',
  },
  productBrand: {
    fontSize: 12,
    color: colors.gray600,
    marginTop: spacing[1],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  categoryTag: {
    fontSize: 10,
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing[1],
    paddingVertical: 2,
    borderRadius: 6,
    color: colors.gray600,
    fontWeight: '500',
    flexShrink: 1,
  },
  stockText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
  lowStock: {
    color: colors.danger,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#46320F',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  retailPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#46320F',
    marginBottom: 2,
  },
  wholesalePrice: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray600,
    textDecorationLine: 'underline',
  },
  cardBody: {
    marginBottom: spacing[4],
  },
  imageGallery: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: spacing[3],
  },
  noImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.gray50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  noImageText: {
    fontSize: 10,
    color: colors.gray400,
    marginTop: 4,
  },
  productImage: {
    width: spacing[20],
    height: spacing[20],
    borderRadius: 12,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  addImageButton: {
    width: spacing[20],
    height: spacing[20],
    borderRadius: 12,
    backgroundColor: colors.gray50,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  footerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[5],
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginBottom: 15,
    fontSize: 16,
    color: colors.gray600,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing[2],
    color: colors.gray600,
  },
  categoryOption: {
    backgroundColor: colors.gray100,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 16,
    marginRight: spacing[2],
  },
  selectedOption: {
    backgroundColor: colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: colors.gray500,
  },
  selectedOptionText: {
    color: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing[3],
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[20],
  },
  emptyImage: {
    width: 200,
    height: 200,
    marginBottom: spacing[4],
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray600,
    marginBottom: spacing[2],
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[20],
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray600,
    marginTop: 12,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[20],
    paddingHorizontal: spacing[4],
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: spacing[2],
  },
  errorText: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  discontinuedCard: {
    opacity: 0.7,
    backgroundColor: colors.gray50,
  },
  discontinuedText: {
    color: colors.gray500,
    textDecorationLine: 'line-through',
  },
  discontinuedTag: {
    fontSize: 10,
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
  stockBadge: {
    fontSize: 8,
    backgroundColor: '#E5F3FF',
    color: '#0066CC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  lowStockBadge: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 8,
    backgroundColor: '#F0F9FF',
    color: '#0369A1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  status_draft: {
    backgroundColor: '#F3F4F6',
    color: '#374151',
  },
  status_pending_review: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  status_published: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  status_discontinued: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    minWidth: 300,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  actionButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  deleteConfirmButton: {
    backgroundColor: '#EF4444',
  },
  deleteConfirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  variantSection: {
    marginTop: 8,
  },
  variantLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  variantColors: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sortModal: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing[5],
    width: '80%',
    maxHeight: '60%',
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: 8,
    marginBottom: spacing[2],
  },
  selectedSortOption: {
    backgroundColor: '#F3F4F6',
  },
  sortOptionText: {
    fontSize: 16,
    color: colors.gray600,
  },
  selectedSortText: {
    color: '#8B5CF6',
    fontWeight: '500',
  },
});
