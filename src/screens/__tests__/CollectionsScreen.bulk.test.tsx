import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import CollectionsScreen from '../CollectionsScreen';
import collectionsSlice from '../../store/collectionsSlice';
import { STRINGS } from '../../constants/i18n';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = { navigate: mockNavigate };

// Mock store with test data
const createTestStore = (products = []) => {
  return configureStore({
    reducer: {
      collections: collectionsSlice,
    },
    preloadedState: {
      collections: {
        products,
        categories: [],
        loading: false,
        error: null,
        isDirty: false,
      },
    },
  });
};

const mockProducts = [
  { product_id: '1', id: '1', title: 'Product 1', status: 'published' },
  { product_id: '2', id: '2', title: 'Product 2', status: 'published' },
  { product_id: '3', id: '3', title: 'Product 3', status: 'published' },
];

describe('CollectionsScreen Bulk Selection', () => {
  it('should show Select All text when no products are selected', () => {
    const store = createTestStore(mockProducts);
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CollectionsScreen navigation={mockNavigation} />
      </Provider>
    );

    // Enable bulk mode
    const bulkButton = getByTestId('bulk-button');
    fireEvent.press(bulkButton);

    // Check if Select All text is visible
    expect(getByText(STRINGS.SELECT_ALL)).toBeTruthy();
  });

  it('should show correct selected count', () => {
    const store = createTestStore(mockProducts);
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CollectionsScreen navigation={mockNavigation} />
      </Provider>
    );

    // Enable bulk mode
    const bulkButton = getByTestId('bulk-button');
    fireEvent.press(bulkButton);

    // Initially should show 0 selected
    expect(getByText(`0 ${STRINGS.SELECTED}`)).toBeTruthy();
  });

  it('should show Unselect All when all products are selected', () => {
    const store = createTestStore(mockProducts);
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <CollectionsScreen navigation={mockNavigation} />
      </Provider>
    );

    // Enable bulk mode
    const bulkButton = getByTestId('bulk-button');
    fireEvent.press(bulkButton);

    // Press Select All
    const selectAllButton = getByText(STRINGS.SELECT_ALL);
    fireEvent.press(selectAllButton);

    // Should now show Unselect All and correct count
    expect(getByText(STRINGS.UNSELECT_ALL)).toBeTruthy();
    expect(getByText(`${mockProducts.length} ${STRINGS.SELECTED}`)).toBeTruthy();
  });

  it('should have all required i18n strings', () => {
    expect(STRINGS.SELECT_ALL).toBeDefined();
    expect(STRINGS.UNSELECT_ALL).toBeDefined();
    expect(STRINGS.SELECTED).toBeDefined();
    expect(STRINGS.COLLECTIONS).toBeDefined();
  });
});
