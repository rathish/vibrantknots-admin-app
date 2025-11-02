export const i18n = {
  en: {
    SUCCESS: 'Success',
    ERROR: 'Error',
    OK: 'OK',
    STOCK_RECORD_UPDATED: 'Stock record updated',
    FAILED_UPDATE_STOCK: 'Failed to update stock record',
    FAILED_CREATE_STOCK: 'Failed to create stock record',
    ADD_STOCK_RECORD: '+ Add Stock Record',
    UPDATE_STOCK_RECORD: 'Update Stock Record',
    STOCK_RECORDS_PRICING: 'Stock Records & Pricing',
    CURRENT_STOCK: 'Current Stock',
    RETAIL_PRICE: 'Retail Price',
    WHOLESALE_PRICE: 'Wholesale Price',
    ENTER_CURRENT_STOCK: 'Enter current stock',
    ENTER_RETAIL_PRICE: 'Enter retail price',
    ENTER_WHOLESALE_PRICE: 'Enter wholesale price',
    PARTNER: 'Partner',
    DELETE_PRODUCT: 'Delete Product',
    DELETE_PRODUCT_CONFIRMATION: 'Are you sure you want to delete "{product}"?',
    DELETE_PRODUCTS: 'Delete Products',
    DELETE_PRODUCTS_CONFIRMATION: 'Are you sure you want to delete {count} products?',
    CANNOT_UNDO: 'This action cannot be undone.',
    SELECT_ALL: 'Select All',
    UNSELECT_ALL: 'Unselect All',
    SELECTED: 'selected',
    COLLECTIONS: 'Collections',
    CANCEL: 'Cancel',
    DELETE: 'Delete',
    UNCATEGORIZED: 'Uncategorized',
  }
};

// Default to English for now
export const STRINGS = i18n.en;

export const formatString = (template: string, params: Record<string, any>): string => {
  return template.replace(/{(\w+)}/g, (match, key) => params[key] || match);
};
