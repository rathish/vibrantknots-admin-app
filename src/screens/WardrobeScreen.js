import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WardrobeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Wardrobe</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Anita</Text>
          <Text style={styles.subtitle}>Active 10 mins ago</Text>
          <Text style={styles.reviews}>150 Reviews</Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="person-outline" size={20} color="#8B5CF6" />
          <Text style={styles.statNumber}>200</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="heart-outline" size={20} color="#8B5CF6" />
          <Text style={styles.statNumber}>130</Text>
          <Text style={styles.statLabel}>Liked Post</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="shirt-outline" size={20} color="#8B5CF6" />
          <Text style={styles.statNumber}>650</Text>
          <Text style={styles.statLabel}>Rented</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Share Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={styles.legendText}>Coat</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={styles.legendText}>Shirt</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Pant</Text>
          </View>
        </View>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartCenter}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>$2,354</Text>
          </View>
        </View>
      </View>

      <View style={styles.frequencySection}>
        <Text style={styles.sectionTitle}>Rental Frequency</Text>
        <View style={styles.chartBars}>
          {[12, 8, 15, 6, 10, 14, 9, 11].map((height, index) => (
            <View key={index} style={styles.barContainer}>
              <View style={[styles.bar, { height: height * 4, backgroundColor: '#8B5CF6' }]} />
            </View>
          ))}
        </View>
      </View>
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
  profileSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  reviews: {
    color: '#8B5CF6',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  editButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  legendRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  chartContainer: {
    height: 120,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  frequencySection: {
    paddingHorizontal: 20,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },
});
