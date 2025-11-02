import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PartnerApiService } from '../core/api-flow/apiService';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchPartners, Partner } from '../store/collectionsSlice';

interface StockRecordFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (stockData: any, partnerData?: any) => void;
  initialData?: {
    quantity_available: number;
    retail_price: number;
    wholesale_price: number;
    currency: string;
    partner_id?: string;
  };
}

export default function StockRecordForm({ visible, onClose, onSave, initialData }: StockRecordFormProps) {
  const dispatch = useAppDispatch();
  const partners = useAppSelector((state) => state.collections.partners);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [showPartnerDropdown, setShowPartnerDropdown] = useState(false);
  const [showNewPartnerForm, setShowNewPartnerForm] = useState(false);
  const [creatingPartner, setCreatingPartner] = useState(false);
  
  const [stockData, setStockData] = useState({
    quantity_available: 0,
    retail_price: 0,
    wholesale_price: 0,
    currency: 'INR',
    ...initialData
  });

  const [newPartnerData, setNewPartnerData] = useState({
    name: '',
    code: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (visible) {
      console.log('StockRecordForm visible, partners:', partners.length);
      if (partners.length === 0) {
        console.log('Dispatching fetchPartners');
        dispatch(fetchPartners());
      }
      if (initialData?.partner_id) {
        setSelectedPartnerId(initialData.partner_id);
      }
    }
  }, [visible, initialData, partners.length, dispatch]);

  const handleSaveNewPartner = () => {
    if (!newPartnerData.name.trim() || !newPartnerData.code.trim()) {
      Alert.alert('Error', 'Partner name and code are required');
      return;
    }

    if (creatingPartner) return;
    
    setCreatingPartner(true);
    PartnerApiService.createPartner(newPartnerData, (stepName: string, status: string, result: any) => {
      if (stepName === 'createPartner' && (status === 'SUCCESS' || status === 'Completed')) {
        const createdPartner = result?.http_response || result;
        setNewPartnerData({ name: '', code: '', email: '', address: '' });
        setShowNewPartnerForm(false);
        setSelectedPartnerId(createdPartner.id);
        dispatch(fetchPartners());
        Alert.alert('Success', 'Partner created successfully');
      } else if (status === 'ERROR' || status === 'Failed') {
        Alert.alert('Error', 'Failed to create partner');
      }
      setCreatingPartner(false);
    });
  };

  const handleSave = () => {
    if (!selectedPartnerId) {
      Alert.alert('Error', 'Please select a partner');
      return;
    }

    const finalStockData = {
      ...stockData,
      partner_id: selectedPartnerId
    };

    onSave(finalStockData);
    handleClose();
  };

  const handleClose = () => {
    setSelectedPartnerId('');
    setShowPartnerDropdown(false);
    setShowNewPartnerForm(false);
    setCreatingPartner(false);
    setStockData({
      quantity_available: 0,
      retail_price: 0,
      wholesale_price: 0,
      currency: 'INR'
    });
    setNewPartnerData({ name: '', code: '', email: '', address: '' });
    onClose();
  };

  const selectedPartner = partners.find(p => p.id === selectedPartnerId);

  return (
    <>
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Stock Record</Text>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Partner Selection */}
            <Text style={styles.sectionTitle}>Partner</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => setShowPartnerDropdown(!showPartnerDropdown)}
            >
              <Text style={styles.dropdownText}>
                {selectedPartner ? `${selectedPartner.name} (${selectedPartner.code})` : 'Select Partner'}
              </Text>
              <Ionicons name={showPartnerDropdown ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </TouchableOpacity>

            {showPartnerDropdown && (
              <View style={styles.dropdown}>
                {partners.map((partner) => (
                  <TouchableOpacity
                    key={partner.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedPartnerId(partner.id);
                      setShowPartnerDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{partner.name}</Text>
                    <Text style={styles.dropdownItemSubtext}>{partner.code}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.dropdownItem, styles.addNewItem]}
                  onPress={() => {
                    setShowPartnerDropdown(false);
                    setShowNewPartnerForm(true);
                  }}
                >
                  <Ionicons name="add" size={16} color="#8B5CF6" />
                  <Text style={[styles.dropdownItemText, styles.addNewText]}>Add New Partner</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Stock Details */}
            <Text style={styles.sectionTitle}>Stock Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Available Quantity</Text>
              <TextInput
                style={styles.input}
                value={stockData.quantity_available.toString()}
                onChangeText={(text) => setStockData({...stockData, quantity_available: parseInt(text) || 0})}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Retail Price</Text>
              <TextInput
                style={styles.input}
                value={stockData.retail_price.toString()}
                onChangeText={(text) => setStockData({...stockData, retail_price: parseFloat(text) || 0})}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wholesale Price</Text>
              <TextInput
                style={styles.input}
                value={stockData.wholesale_price.toString()}
                onChangeText={(text) => setStockData({...stockData, wholesale_price: parseFloat(text) || 0})}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Currency</Text>
              <TextInput
                style={styles.input}
                value={stockData.currency}
                onChangeText={(text) => setStockData({...stockData, currency: text})}
                placeholder="INR"
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* New Partner Form Modal - Separate from main modal */}
    <Modal visible={showNewPartnerForm} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Partner</Text>
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Partner Name *</Text>
              <TextInput
                style={styles.input}
                value={newPartnerData.name}
                onChangeText={(text) => setNewPartnerData({...newPartnerData, name: text})}
                placeholder="Enter partner name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Partner Code *</Text>
              <TextInput
                style={styles.input}
                value={newPartnerData.code}
                onChangeText={(text) => setNewPartnerData({...newPartnerData, code: text})}
                placeholder="Enter partner code"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={newPartnerData.email}
                onChangeText={(text) => setNewPartnerData({...newPartnerData, email: text})}
                placeholder="Enter email address"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newPartnerData.address}
                onChangeText={(text) => setNewPartnerData({...newPartnerData, address: text})}
                placeholder="Enter address"
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.saveButton, creatingPartner && styles.disabledButton]} 
              onPress={handleSaveNewPartner}
              disabled={creatingPartner}
            >
              <Text style={styles.saveButtonText}>
                {creatingPartner ? 'Creating...' : 'Create Partner'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowNewPartnerForm(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
    maxHeight: 200,
    overflow: 'scroll',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownItemSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  addNewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  addNewText: {
    color: '#8B5CF6',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  cancelButtonText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
