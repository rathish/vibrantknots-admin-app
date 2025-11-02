import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Provider, useDispatch } from 'react-redux';
import { store } from './src/store';
import { fetchProducts, fetchCategories } from './src/store/collectionsSlice';

import LoginScreen from './src/screens/LoginScreen';
import CollectionsScreen from './src/screens/CollectionsScreen';
import ProductEditScreen from './src/screens/ProductEditScreen';
import ProductAddScreen from './src/screens/ProductAddScreen';
import CategoryManagementScreen from './src/screens/CategoryManagementScreen';
import CameraScreen from './src/screens/CameraScreen';
import MarketingScreen from './src/screens/MarketingScreen';
import MediaContentScreen from './src/screens/MediaContentScreen';
import InboxScreen from './src/screens/InboxScreen';
import FilterScreen from './src/screens/FilterScreen';

type Screen = 'Login' | 'Main' | 'Filter' | 'ProductEdit' | 'ProductAdd' | 'CategoryManagement';
type Tab = 'Collections' | 'Marketing' | 'Camera' | 'Media Content' | 'Inbox';

interface TabItem {
  name: Tab;
  icon: keyof typeof Ionicons.glyphMap;
  isCenter?: boolean;
}

function AppContent(): JSX.Element {
  const [currentScreen, setCurrentScreen] = useState<Screen>('Login');
  const [activeTab, setActiveTab] = useState<Tab>('Collections');
  const [hasLoadedCollections, setHasLoadedCollections] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dispatch = useDispatch();

  const navigate = (screen: Screen, product = null): void => {
    if (product) setSelectedProduct(product);
    setCurrentScreen(screen);
  };
  const goBack = (): void => setCurrentScreen('Main');

  const handleTabPress = (tabName: Tab) => {
    setActiveTab(tabName);
    
    // Fetch both products and categories when Collections tab is clicked
    if (tabName === 'Collections' && !hasLoadedCollections) {
      console.log('Loading collections data for the first time...');
      dispatch(fetchProducts());
      dispatch(fetchCategories());
      setHasLoadedCollections(true);
    }
  };

  const renderScreen = (): JSX.Element => {
    if (currentScreen === 'Login') return <LoginScreen navigation={{ navigate }} />;
    if (currentScreen === 'Filter') return <FilterScreen navigation={{ goBack }} />;
    if (currentScreen === 'ProductEdit') return <ProductEditScreen navigation={{ goBack }} product={selectedProduct} />;
    if (currentScreen === 'ProductAdd') return <ProductAddScreen navigation={{ goBack }} />;
    if (currentScreen === 'CategoryManagement') return <CategoryManagementScreen navigation={{ goBack }} />;
    if (currentScreen === 'Main') {
      return (
        <View testID="main-screen">
          {activeTab === 'Collections' && <CollectionsScreen navigation={{ navigate }} />}
          {activeTab === 'Marketing' && <MarketingScreen />}
          {activeTab === 'Camera' && <CameraScreen />}
          {activeTab === 'Media Content' && <MediaContentScreen />}
          {activeTab === 'Inbox' && <InboxScreen />}
        </View>
      );
    }
    return <CollectionsScreen navigation={{ navigate }} />;
  };

  const tabs: TabItem[] = [
    { name: 'Collections', icon: 'grid' },
    { name: 'Marketing', icon: 'megaphone' },
    { name: 'Camera', icon: 'camera', isCenter: true },
    { name: 'Inbox', icon: 'chatbubbles' },
    { name: 'Media Content', icon: 'play-circle' }
  ];

  return (
    <View style={[styles.container, currentScreen === 'Main' && styles.containerWithTabBar]} testID="app-container">
      {renderScreen()}
      {currentScreen === 'Main' && (
        <View style={styles.tabBar} testID="tab-bar">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tabItem, tab.isCenter && styles.centerTab]}
              onPress={() => handleTabPress(tab.name)}
              testID={`tab-${tab.name}`}
            >
              <View style={[
                tab.isCenter && styles.cameraButton,
                tab.isCenter && activeTab === tab.name && styles.cameraButtonActive
              ]}>
                <Ionicons
                  name={activeTab === tab.name ? tab.icon : `${tab.icon}-outline` as keyof typeof Ionicons.glyphMap}
                  size={tab.isCenter ? 32 : 24}
                  color={tab.isCenter ? 'white' : (activeTab === tab.name ? '#FDC83C' : '#666')}
                />
              </View>
              <Text style={[
                styles.tabText,
                { color: activeTab === tab.name ? '#FDC83C' : '#666' },
                tab.isCenter && styles.centerTabText
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function App(): JSX.Element {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerWithTabBar: {
    paddingBottom: 90,
  },
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 8,
    paddingBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1000,
    zIndex: 1000,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  centerTab: {
    marginTop: -20,
  },
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FDC83C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraButtonActive: {
    backgroundColor: '#F59E0B',
  },
  tabText: {
    fontSize: 10,
    marginTop: 4,
  },
  centerTabText: {
    marginTop: 8,
  },
});
