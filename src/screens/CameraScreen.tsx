import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function CameraScreen(): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
        Alert.alert('Image selected!', 'Image ready for upload');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const takePhoto = (): void => {
    Alert.alert('Camera', 'Camera functionality available on mobile devices');
  };

  return (
    <SafeAreaView style={styles.container} testID="camera-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Camera</Text>
      </View>

      <View style={styles.cameraArea}>
        <View style={styles.placeholder}>
          <Ionicons name="camera" size={80} color="#FDC83C" />
          <Text style={styles.placeholderText}>Camera Preview</Text>
          <Text style={styles.subText}>Web version - Use gallery to select images</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
          <Ionicons name="images" size={32} color="white" />
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
          <View style={styles.captureButtonInner}>
            <Ionicons name="camera" size={32} color="#FDC83C" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.flipButton} onPress={() => Alert.alert('Flip', 'Camera flip available on mobile')}>
          <Ionicons name="camera-reverse" size={32} color="white" />
          <Text style={styles.buttonText}>Flip</Text>
        </TouchableOpacity>
      </View>

      {selectedImage && (
        <View style={styles.selectedImageInfo}>
          <Text style={styles.selectedText}>✓ Image selected and ready</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cameraArea: {
    flex: 1,
    margin: 20,
    backgroundColor: '#000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  subText: {
    color: '#999',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  galleryButton: {
    alignItems: 'center',
    backgroundColor: '#FDC83C',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  flipButton: {
    alignItems: 'center',
    backgroundColor: '#FDC83C',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FDC83C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  selectedImageInfo: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    alignItems: 'center',
  },
  selectedText: {
    color: 'white',
    fontWeight: '600',
  },
});
