import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Alert, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCategories, createCategory, updateCategory, deleteCategory, Category } from '../store/collectionsSlice';
import { STRINGS, formatString } from '../constants/i18n';

interface CategoryManagementScreenProps {
  navigation: {
    goBack: () => void;
  };
}

export default function CategoryManagementScreen({ navigation }: CategoryManagementScreenProps): JSX.Element {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.collections);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [alertModal, setAlertModal] = useState<{visible: boolean, title: string, message: string, onConfirm?: () => void}>({
    visible: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Category name is required'
      });
      return;
    }

    try {
      await dispatch(createCategory({
        name: categoryName,
        description: categoryDescription || null
      })).unwrap();
      
      setCategoryName('');
      setCategoryDescription('');
      setShowAddModal(false);
      setAlertModal({
        visible: true,
        title: 'Success',
        message: 'Category created successfully'
      });
    } catch (error) {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Failed to create category'
      });
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !categoryName.trim()) return;

    try {
      await dispatch(updateCategory({
        id: editingCategory.id,
        name: categoryName,
        description: categoryDescription || null
      })).unwrap();
      
      setEditingCategory(null);
      setCategoryName('');
      setCategoryDescription('');
      setAlertModal({
        visible: true,
        title: 'Success',
        message: 'Category updated successfully'
      });
    } catch (error) {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Failed to update category'
      });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      // Get all products and filter by category_id
      const response = await fetch('http://localhost:8000/api/v1/products/list');
      if (response.ok) {
        const products = await response.json();
        const productArray = Array.isArray(products) ? products : [];
        
        // Filter products that have this category_id
        const attachedProducts = productArray.filter(product => 
          product.category_id === category.id || 
          (product.category_ids && product.category_ids.includes(category.id))
        );
        
        if (attachedProducts.length > 0) {
          setAlertModal({
            visible: true,
            title: 'Cannot Delete Category',
            message: `This category is used by ${attachedProducts.length} product(s). Please remove or reassign these products before deleting the category.`
          });
          return;
        }
      }
    } catch (error) {
      setAlertModal({
        visible: true,
        title: 'Error',
        message: 'Failed to check category usage'
      });
      return;
    }

    setAlertModal({
      visible: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.name}"?`,
      onConfirm: async () => {
        try {
          await dispatch(deleteCategory(category.id)).unwrap();
          setAlertModal({
            visible: true,
            title: 'Success',
            message: 'Category deleted successfully'
          });
        } catch (error) {
          setAlertModal({
            visible: true,
            title: 'Error',
            message: 'Failed to delete category'
          });
        }
      }
    });
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryDescription(category.description || '');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{STRINGS.MANAGE_CATEGORIES}</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={styles.addButton}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              {category.description && (
                <Text style={styles.categoryDescription}>{category.description}</Text>
              )}
            </View>
            <View style={styles.categoryActions}>
              <TouchableOpacity 
                onPress={() => openEditModal(category)}
                style={styles.editButton}
              >
                <Ionicons name="pencil" size={18} color="#8B5CF6" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => handleDeleteCategory(category)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={showAddModal || !!editingCategory} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowAddModal(false);
                  setEditingCategory(null);
                  setCategoryName('');
                  setCategoryDescription('');
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category Name *</Text>
              <TextInput
                style={styles.input}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="Enter category name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={categoryDescription}
                onChangeText={setCategoryDescription}
                placeholder="Enter category description"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={styles.saveButton}
              onPress={editingCategory ? handleEditCategory : handleAddCategory}
            >
              <Text style={styles.saveButtonText}>
                {editingCategory ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Custom Alert Modal */}
      <Modal visible={alertModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.alertModal}>
            <Text style={styles.alertTitle}>{alertModal.title}</Text>
            <Text style={styles.alertMessage}>{alertModal.message}</Text>
            <View style={styles.alertButtons}>
              {alertModal.onConfirm ? (
                <>
                  <TouchableOpacity 
                    style={[styles.alertButton, styles.cancelButton]}
                    onPress={() => setAlertModal({visible: false, title: '', message: ''})}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.alertButton, styles.confirmButton]}
                    onPress={() => {
                      setAlertModal({visible: false, title: '', message: ''});
                      alertModal.onConfirm?.();
                    }}
                  >
                    <Text style={styles.confirmButtonText}>Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={[styles.alertButton, styles.okButton]}
                  onPress={() => setAlertModal({visible: false, title: '', message: ''})}
                >
                  <Text style={styles.okButtonText}>OK</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  alertModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
  },
  okButton: {
    backgroundColor: '#8B5CF6',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  okButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});
