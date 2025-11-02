import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const products = [
  { id: 1, name: 'Best Warm Coat for ladies wear', price: '$150', liked: false },
  { id: 2, name: 'Best Warm Coat for ladies wear', price: '$150', liked: false },
  { id: 3, name: 'Best Warm Coat for ladies wear', price: '$150', liked: false },
  { id: 4, name: 'Best Warm Coat for ladies wear', price: '$150', liked: true },
];

export default function ShopScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Shop</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search here..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => navigation.navigate('Filter')}
        >
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.grid}>
          {products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImage}>
                <TouchableOpacity style={styles.heartButton}>
                  <Ionicons 
                    name={product.liked ? "heart" : "heart-outline"} 
                    size={20} 
                    color={product.liked ? "#EF4444" : "#666"} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.productName}>{product.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{product.price}</Text>
                <View style={styles.colorDot} />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#8B5CF6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },
  productImage: {
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  colorDot: {
    width: 12,
    height: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 6,
  },
});
