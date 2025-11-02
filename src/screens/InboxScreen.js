import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const sellers = [
  { id: 1, name: 'Amy', avatar: 'A' },
  { id: 2, name: 'Benjamin', avatar: 'B' },
  { id: 3, name: 'Johan', avatar: 'J' },
  { id: 4, name: 'Anita', avatar: 'A' },
  { id: 5, name: 'Fajah', avatar: 'F' },
];

const chats = [
  { id: 1, name: 'Amy Scott', message: 'What about the blue shirt for that?', time: 'yesterday', avatar: 'A' },
  { id: 2, name: 'Scarlet Mia', message: 'What about the blue shirt for that?', time: '5:18 am', avatar: 'S' },
];

export default function InboxScreen() {
  return (
    <SafeAreaView style={styles.container} testID="inbox-screen">
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Inbox</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search Here"
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Request</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favourite Sellers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sellersContainer}>
            {sellers.map((seller) => (
              <View key={seller.id} style={styles.sellerItem}>
                <View style={styles.sellerAvatar}>
                  <Text style={styles.sellerAvatarText}>{seller.avatar}</Text>
                </View>
                <Text style={styles.sellerName}>{seller.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chats</Text>
          {chats.map((chat) => (
            <TouchableOpacity key={chat.id} style={styles.chatItem}>
              <View style={styles.chatAvatar}>
                <Text style={styles.chatAvatarText}>{chat.avatar}</Text>
              </View>
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{chat.time}</Text>
                </View>
                <Text style={styles.chatMessage}>{chat.message}</Text>
              </View>
            </TouchableOpacity>
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
    backgroundColor: '#FDC83C',
    width: 44,
    height: 44,
    borderRadius: 22,
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
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sellersContainer: {
    paddingLeft: 20,
  },
  sellerItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FDC83C',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sellerAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sellerName: {
    fontSize: 12,
    color: '#666',
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
  },
  chatAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#FDC83C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  chatAvatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatTime: {
    fontSize: 12,
    color: '#666',
  },
  chatMessage: {
    fontSize: 14,
    color: '#666',
  },
});
