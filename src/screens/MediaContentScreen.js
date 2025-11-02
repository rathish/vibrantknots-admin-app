import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mediaContent = [
  { id: 1, type: 'reel', title: 'Summer Collection Showcase', views: '12.5K', likes: '890', platform: 'Instagram' },
  { id: 2, type: 'post', title: 'New Arrivals - Denim Collection', views: '8.3K', likes: '654', platform: 'Facebook' },
  { id: 3, type: 'reel', title: 'Behind the Scenes - Photoshoot', views: '15.2K', likes: '1.2K', platform: 'TikTok' },
  { id: 4, type: 'post', title: 'Customer Styling Tips', views: '6.7K', likes: '432', platform: 'Instagram' },
];

const genAITemplates = [
  { id: 1, name: 'Product Showcase', description: 'Dynamic product reveal with music' },
  { id: 2, name: 'Fashion Lookbook', description: 'Stylish outfit combinations' },
  { id: 3, name: 'Brand Story', description: 'Emotional brand narrative' },
  { id: 4, name: 'Seasonal Campaign', description: 'Weather-themed promotions' },
];

export default function MediaContentScreen() {
  const [activeTab, setActiveTab] = useState('Content');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGenAIModal, setShowGenAIModal] = useState(false);
  const [newContent, setNewContent] = useState({ title: '', platform: 'Instagram', type: 'post' });
  const [genAIPrompt, setGenAIPrompt] = useState({ template: '', product: '', style: '', duration: '15s' });

  const createContent = () => {
    if (newContent.title) {
      setNewContent({ title: '', platform: 'Instagram', type: 'post' });
      setShowCreateModal(false);
    }
  };

  const generateVideo = () => {
    if (genAIPrompt.product) {
      setGenAIPrompt({ template: '', product: '', style: '', duration: '15s' });
      setShowGenAIModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} testID="media-content-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Media Content</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.genAIButton}
            onPress={() => setShowGenAIModal(true)}
          >
            <Ionicons name="sparkles" size={20} color="white" />
            <Text style={styles.genAIText}>GenAI</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        {['Content', 'Analytics', 'Scheduled'].map((tab) => (
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
        {activeTab === 'Content' && (
          <View>
            <View style={styles.filterRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['All', 'Reels', 'Posts', 'Stories'].map((filter) => (
                  <TouchableOpacity key={filter} style={styles.filterChip}>
                    <Text style={styles.filterText}>{filter}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {mediaContent.map((content) => (
              <View key={content.id} style={styles.contentCard}>
                <View style={styles.contentHeader}>
                  <View style={styles.contentInfo}>
                    <View style={styles.typeIndicator}>
                      <Ionicons 
                        name={content.type === 'reel' ? 'play-circle' : 'image'} 
                        size={16} 
                        color="#FDC83C" 
                      />
                      <Text style={styles.typeText}>{content.type.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.contentTitle}>{content.title}</Text>
                    <Text style={styles.platform}>{content.platform}</Text>
                  </View>
                  <View style={styles.contentThumbnail}>
                    <Ionicons name="image" size={32} color="#FDC83C" />
                  </View>
                </View>

                <View style={styles.contentStats}>
                  <View style={styles.stat}>
                    <Ionicons name="eye" size={16} color="#666" />
                    <Text style={styles.statText}>{content.views}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="heart" size={16} color="#EF4444" />
                    <Text style={styles.statText}>{content.likes}</Text>
                  </View>
                  <View style={styles.stat}>
                    <Ionicons name="share-social" size={16} color="#666" />
                    <Text style={styles.statText}>Share</Text>
                  </View>
                </View>

                <View style={styles.contentActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="pencil" size={16} color="#FDC83C" />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="analytics" size={16} color="#FDC83C" />
                    <Text style={styles.actionText}>Analytics</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="copy" size={16} color="#FDC83C" />
                    <Text style={styles.actionText}>Duplicate</Text>
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
                <Ionicons name="eye" size={24} color="#FDC83C" />
                <Text style={styles.analyticsValue}>42.8K</Text>
                <Text style={styles.analyticsLabel}>Total Views</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Ionicons name="heart" size={24} color="#EF4444" />
                <Text style={styles.analyticsValue}>3.2K</Text>
                <Text style={styles.analyticsLabel}>Total Likes</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Ionicons name="share-social" size={24} color="#10B981" />
                <Text style={styles.analyticsValue}>890</Text>
                <Text style={styles.analyticsLabel}>Shares</Text>
              </View>
              <View style={styles.analyticsCard}>
                <Ionicons name="trending-up" size={24} color="#F59E0B" />
                <Text style={styles.analyticsValue}>7.6%</Text>
                <Text style={styles.analyticsLabel}>Engagement</Text>
              </View>
            </View>

            <View style={styles.platformStats}>
              <Text style={styles.sectionTitle}>Platform Performance</Text>
              {['Instagram', 'Facebook', 'TikTok', 'YouTube'].map((platform) => (
                <View key={platform} style={styles.platformRow}>
                  <Text style={styles.platformName}>{platform}</Text>
                  <View style={styles.platformBar}>
                    <View style={[styles.platformProgress, { width: `${Math.random() * 100}%` }]} />
                  </View>
                  <Text style={styles.platformValue}>{Math.floor(Math.random() * 20)}K</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'Scheduled' && (
          <View>
            <Text style={styles.emptyState}>No scheduled content</Text>
            <TouchableOpacity style={styles.scheduleButton}>
              <Ionicons name="calendar" size={20} color="#FDC83C" />
              <Text style={styles.scheduleText}>Schedule New Content</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Create Content Modal */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Content</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Content Title"
              value={newContent.title}
              onChangeText={(text) => setNewContent({...newContent, title: text})}
            />

            <View style={styles.optionRow}>
              <Text style={styles.label}>Type:</Text>
              {['post', 'reel', 'story'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.option, newContent.type === type && styles.selectedOption]}
                  onPress={() => setNewContent({...newContent, type})}
                >
                  <Text style={[styles.optionText, newContent.type === type && styles.selectedOptionText]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={createContent}>
              <Text style={styles.saveButtonText}>Create Content</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* GenAI Video Modal */}
      <Modal visible={showGenAIModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate AI Video</Text>
              <TouchableOpacity onPress={() => setShowGenAIModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Choose Template</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
              {genAITemplates.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.templateCard, genAIPrompt.template === template.name && styles.selectedTemplate]}
                  onPress={() => setGenAIPrompt({...genAIPrompt, template: template.name})}
                >
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDesc}>{template.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={styles.input}
              placeholder="Product/Theme"
              value={genAIPrompt.product}
              onChangeText={(text) => setGenAIPrompt({...genAIPrompt, product: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Style/Mood (e.g., elegant, playful, modern)"
              value={genAIPrompt.style}
              onChangeText={(text) => setGenAIPrompt({...genAIPrompt, style: text})}
            />

            <View style={styles.optionRow}>
              <Text style={styles.label}>Duration:</Text>
              {['15s', '30s', '60s'].map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[styles.option, genAIPrompt.duration === duration && styles.selectedOption]}
                  onPress={() => setGenAIPrompt({...genAIPrompt, duration})}
                >
                  <Text style={[styles.optionText, genAIPrompt.duration === duration && styles.selectedOptionText]}>
                    {duration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.genButton} onPress={generateVideo}>
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.genButtonText}>Generate Video</Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  genAIButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  genAIText: {
    color: 'white',
    fontSize: 12,
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
  filterRow: {
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  contentInfo: {
    flex: 1,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 10,
    color: '#FDC83C',
    fontWeight: '600',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  platform: {
    fontSize: 12,
    color: '#666',
  },
  contentThumbnail: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentStats: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 15,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  contentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    color: '#FDC83C',
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
  platformStats: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  platformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  platformName: {
    width: 80,
    fontSize: 14,
    color: '#374151',
  },
  platformBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginHorizontal: 15,
  },
  platformProgress: {
    height: 8,
    backgroundColor: '#FDC83C',
    borderRadius: 4,
  },
  platformValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FDC83C',
  },
  emptyState: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 50,
    marginBottom: 20,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  scheduleText: {
    color: '#FDC83C',
    fontSize: 16,
    fontWeight: '500',
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
    maxHeight: '80%',
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  option: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedOption: {
    backgroundColor: '#FDC83C',
  },
  optionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedOptionText: {
    color: 'white',
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
  templateScroll: {
    marginBottom: 20,
  },
  templateCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
    width: 150,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTemplate: {
    borderColor: '#FDC83C',
    backgroundColor: '#F3F4F6',
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 12,
    color: '#666',
  },
  genButton: {
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  genButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
