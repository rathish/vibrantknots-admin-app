import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const campaigns = [
  { id: 1, name: 'Summer Sale 2024', status: 'Active', reach: '12.5K', clicks: '1.2K', budget: '$500' },
  { id: 2, name: 'New Collection Launch', status: 'Paused', reach: '8.3K', clicks: '890', budget: '$300' },
  { id: 3, name: 'Weekend Special', status: 'Completed', reach: '15.2K', clicks: '2.1K', budget: '$750' },
];

const analytics = {
  totalReach: '36K',
  totalClicks: '4.2K',
  conversionRate: '12.5%',
  totalSpent: '$1,550'
};

export default function MarketingScreen() {
  const [activeTab, setActiveTab] = useState('Campaigns');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', budget: '', target: '' });

  const createCampaign = () => {
    if (newCampaign.name && newCampaign.budget) {
      setNewCampaign({ name: '', budget: '', target: '' });
      setShowCreateModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="marketing-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Marketing</Text>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['Campaigns', 'Analytics', 'Promotions'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'Campaigns' && (
          <View>
            {campaigns.map((campaign) => (
              <View key={campaign.id} style={styles.campaignCard}>
                <View style={styles.campaignHeader}>
                  <Text style={styles.campaignName}>{campaign.name}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: 
                      campaign.status === 'Active' ? '#10B981' :
                      campaign.status === 'Paused' ? '#F59E0B' : '#6B7280'
                    }
                  ]}>
                    <Text style={styles.statusText}>{campaign.status}</Text>
                  </View>
                </View>
                
                <View style={styles.campaignStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{campaign.reach}</Text>
                    <Text style={styles.statLabel}>Reach</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{campaign.clicks}</Text>
                    <Text style={styles.statLabel}>Clicks</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statValue}>{campaign.budget}</Text>
                    <Text style={styles.statLabel}>Budget</Text>
                  </View>
                </View>

                <View style={styles.campaignActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="play" size={16} color="#69480F" />
                    <Text style={styles.actionText}>Resume</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="pencil" size={16} color="#69480F" />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="bar-chart" size={16} color="#69480F" />
                    <Text style={styles.actionText}>Analytics</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Analytics' && (
          <View>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <Ionicons name="eye" size={24} color="#69480F" />
                <Text style={styles.analyticsValue}>{analytics.totalReach}</Text>
                <Text style={styles.analyticsLabel}>Total Reach</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Ionicons name="hand-left" size={24} color="#10B981" />
                <Text style={styles.analyticsValue}>{analytics.totalClicks}</Text>
                <Text style={styles.analyticsLabel}>Total Clicks</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Ionicons name="trending-up" size={24} color="#F59E0B" />
                <Text style={styles.analyticsValue}>{analytics.conversionRate}</Text>
                <Text style={styles.analyticsLabel}>Conversion Rate</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Ionicons name="card" size={24} color="#EF4444" />
                <Text style={styles.analyticsValue}>{analytics.totalSpent}</Text>
                <Text style={styles.analyticsLabel}>Total Spent</Text>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Campaign Performance</Text>
              <View style={styles.chartPlaceholder}>
                <Ionicons name="bar-chart" size={48} color="#69480F" />
                <Text style={styles.chartText}>Performance Chart</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'Promotions' && (
          <View>
            <View style={styles.promotionCard}>
              <View style={styles.promotionHeader}>
                <Text style={styles.promotionTitle}>Flash Sale</Text>
                <Text style={styles.promotionDiscount}>50% OFF</Text>
              </View>
              <Text style={styles.promotionDescription}>
                Limited time offer on selected items
              </Text>
              <View style={styles.promotionActions}>
                <TouchableOpacity style={styles.promotionButton}>
                  <Text style={styles.promotionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.promotionButton, styles.activePromotion]}>
                  <Text style={[styles.promotionButtonText, styles.activePromotionText]}>Active</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.promotionCard}>
              <View style={styles.promotionHeader}>
                <Text style={styles.promotionTitle}>New Customer</Text>
                <Text style={styles.promotionDiscount}>20% OFF</Text>
              </View>
              <Text style={styles.promotionDescription}>
                Welcome discount for first-time buyers
              </Text>
              <View style={styles.promotionActions}>
                <TouchableOpacity style={styles.promotionButton}>
                  <Text style={styles.promotionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.promotionButton}>
                  <Text style={styles.promotionButtonText}>Activate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Campaign</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Campaign Name"
              value={newCampaign.name}
              onChangeText={(text) => setNewCampaign({...newCampaign, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Budget ($)"
              value={newCampaign.budget}
              onChangeText={(text) => setNewCampaign({...newCampaign, budget: text})}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Target Audience"
              value={newCampaign.target}
              onChangeText={(text) => setNewCampaign({...newCampaign, target: text})}
            />

            <TouchableOpacity style={styles.saveButton} onPress={createCampaign}>
              <Text style={styles.saveButtonText}>Create Campaign</Text>
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
  createButton: {
    backgroundColor: '#FDC83C',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#69480F',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#69480F',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  campaignCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  campaignStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#69480F',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  campaignActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    color: '#69480F',
    fontSize: 14,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginVertical: 8,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  chartPlaceholder: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  chartText: {
    color: '#666',
    marginTop: 10,
  },
  promotionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  promotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  promotionDiscount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  promotionDescription: {
    color: '#666',
    marginBottom: 15,
  },
  promotionActions: {
    flexDirection: 'row',
    gap: 10,
  },
  promotionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#69480F',
  },
  activePromotion: {
    backgroundColor: '#FDC83C',
  },
  promotionButtonText: {
    color: '#69480F',
    fontSize: 14,
  },
  activePromotionText: {
    color: 'white',
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FDC83C',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
