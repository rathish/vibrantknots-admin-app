import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FilterScreen({ navigation }) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [priceRange, setPriceRange] = useState([50, 150]);

  const colors = ['#000000', '#9CA3AF', '#EF4444', '#3B82F6', '#F59E0B'];
  const styles_list = ['Men\'s Formal Shirt', 'Men\'s Casual Shirt', 'Women\'s Formal Shirt', 'Women\'s Casual Shirt'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Filter</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.sizeContainer}>
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  selectedSize === size && styles.selectedSizeButton
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text style={[
                  styles.sizeText,
                  selectedSize === size && styles.selectedSizeText
                ]}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>${priceRange[0]}</Text>
            <View style={styles.slider}>
              <View style={styles.sliderTrack} />
              <View style={styles.sliderRange} />
            </View>
            <Text style={styles.priceLabel}>${priceRange[1]}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Colors</Text>
          <View style={styles.colorContainer}>
            {colors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.colorButton, { backgroundColor: color }]}
              />
            ))}
            <TouchableOpacity style={styles.addColorButton}>
              <Ionicons name="add" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Style</Text>
          <View style={styles.styleContainer}>
            <TouchableOpacity style={styles.typeSelector}>
              <Text style={styles.typeSelectorText}>Type</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>
            
            {styles_list.map((style, index) => (
              <TouchableOpacity key={index} style={styles.styleItem}>
                <Text style={styles.styleText}>{style}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.applyButton}>
        <Text style={styles.applyButtonText}>Apply Filter</Text>
      </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSizeButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  sizeText: {
    color: '#374151',
    fontWeight: '500',
  },
  selectedSizeText: {
    color: 'white',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  slider: {
    flex: 1,
    height: 4,
    position: 'relative',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  sliderRange: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    left: '20%',
    right: '20%',
  },
  colorContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  addColorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  styleContainer: {
    gap: 15,
  },
  typeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  typeSelectorText: {
    color: '#666',
  },
  styleItem: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  styleText: {
    color: '#374151',
  },
  applyButton: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
