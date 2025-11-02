import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StockApiService, ProductApiService } from '../core/api-flow/apiService';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchProducts, fetchPartners } from '../store/collectionsSlice';
import StockRecordForm from './StockRecordForm';

interface StockRecord {
  id: string;
  product_id: string;
  partner_id: string;
  partner_sku: string;
  quantity_available: number;
  retail_price: number;
  wholesale_price: number;
  currency: string;
  updated_at: string;
}

interface Product {
  id: string;
  title: string;
  sku_id: string;
}

export default function StockManagementScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.collections.products);
  const partners = useAppSelector((state) => state.collections.partners);
  const [stockRecords, setStockRecords] = useState<StockRecord[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [showStockForm, setShowStockForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
    if (partners.length === 0) {
      dispatch(fetchPartners());
    }
  }, [dispatch, products.length, partners.length]);

  const fetchStockRecords = (productId: string) => {
    setLoading(true);
    StockApiService.fetchProductStock(productId, (stepName: string, status: string, result: any) => {
      if (stepName === 'fetchProductStock' && status === 'SUCCESS') {
        const stockData = result?.http_response || result || [];
        setStockRecords(Array.isArray(stockData) ? stockData : []);
      }
      setLoading(false);
    });
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    fetchStockRecords(productId);
  };

  const handleAddStock = () => {
    if (!selectedProductId) {
      Alert.alert('Error', 'Please select a product first');
      return;
    }
    setShowStockForm(true);
  };

  const handleStockSave = (stockData: any) => {
    StockApiService.createProductStock(
      selectedProductId,
      stockData,
      (stepName: string, status: string, result: any) => {
        if (stepName === 'createProductStock' && status === 'SUCCESS') {
          Alert.alert('Success', 'Stock record created successfully');
          fetchStockRecords(selectedProductId); // Refresh the list
        } else if (status === 'ERROR') {
          Alert.alert('Error', 'Failed to create stock record');
        }
      }
    );
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Stock Management</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Product Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Product</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productList}>
            {products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  selectedProductId === product.id && styles.selectedProductCard
                ]}
                onPress={() => handleProductSelect(product.id)}
              >
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productSku}>{product.sku_id}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stock Records */}
        {selectedProduct && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Stock Records for {selectedProduct.title}
              </Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddStock}>
                <Ionicons name="add" size={20} color="#8B5CF6" />
                <Text style={styles.addButtonText}>Add Stock</Text>
              </TouchableOpacity>
            </View>

            {stockRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No stock records found</Text>
                <Text style={styles.emptySubtext}>Add a stock record to get started</Text>
              </View>
            ) : (
              stockRecords.map((stock) => (
                <View key={stock.id} style={styles.stockCard}>
                  <View style={styles.stockHeader}>
                    <Text style={styles.stockTitle}>Partner: {stock.partner_sku}</Text>
                    <Text style={styles.stockQuantity}>Qty: {stock.quantity_available}</Text>
                  </View>
                  <View style={styles.stockDetails}>
                    <Text style={styles.stockPrice}>
                      Retail: {stock.currency} {stock.retail_price}
                    </Text>
                    <Text style={styles.stockPrice}>
                      Wholesale: {stock.currency} {stock.wholesale_price}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <StockRecordForm
        visible={showStockForm}
        onClose={() => setShowStockForm(false)}
        onSave={handleStockSave}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  productList: {
    flexDirection: 'row',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedProductCard: {
    borderColor: '#8B5CF6',
    backgroundColor: '#f8f9ff',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productSku: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  addButtonText: {
    color: '#8B5CF6',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  stockCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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
  stockQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockPrice: {
    fontSize: 12,
    color: '#666',
  },
});
