describe('Enhanced Product Features', () => {
  beforeEach(() => {
    cy.visit('http://localhost:19006');
    cy.wait(2000);
  });

  describe('Product Creation with Categories', () => {
    it('should create product with category selection', () => {
      // Open add product modal
      cy.get('[data-testid="add-product-button"]').should('be.visible').click();
      cy.wait(1000);

      // Fill basic product information
      cy.get('input[placeholder="Product title"]').type('Test Product with Category');
      cy.get('input[placeholder="Product description"]').type('Test description');
      cy.get('input[placeholder="SKU ID"]').type('TEST-001');

      // Select categories
      cy.get('[data-testid="category-option"]').first().click();
      cy.get('[data-testid="category-option"]').eq(1).click();

      // Save product
      cy.get('[data-testid="save-product-button"]').click();
      cy.wait(2000);

      // Verify product was created
      cy.contains('Test Product with Category').should('be.visible');
    });

    it('should create product with color variants', () => {
      cy.get('[data-testid="add-product-button"]').click();
      cy.wait(1000);

      // Fill basic info
      cy.get('input[placeholder="Product title"]').type('Product with Colors');
      
      // Add color variant
      cy.get('[data-testid="add-variant-button"]').click();
      cy.get('input[placeholder="Color name"]').type('Red');
      cy.get('input[placeholder="#FF0000"]').clear().type('#FF0000');
      cy.get('input[placeholder="RED-001"]').type('RED-001');

      // Save product
      cy.get('[data-testid="save-product-button"]').click();
      cy.wait(2000);

      cy.contains('Product with Colors').should('be.visible');
    });
  });

  describe('Product Editing Features', () => {
    it('should edit product with stock and price details', () => {
      // Find and edit a product
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="edit-button"]').click();
      });
      cy.wait(1000);

      // Update stock information
      cy.get('input[placeholder="Current stock quantity"]').clear().type('100');
      cy.get('input[placeholder="Reserved stock quantity"]').clear().type('10');
      cy.get('input[placeholder="Minimum stock level"]').clear().type('5');

      // Update pricing
      cy.get('input[placeholder="Enter retail price"]').clear().type('29.99');
      cy.get('input[placeholder="Enter wholesale price"]').clear().type('19.99');

      // Save changes
      cy.get('[data-testid="save-changes-button"]').click();
      cy.wait(2000);

      // Verify changes were saved
      cy.get('[data-testid="product-card"]').first().should('contain', '$29.99');
    });

    it('should update product categories', () => {
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="edit-button"]').click();
      });
      cy.wait(1000);

      // Select different categories
      cy.get('[data-testid="category-option"]').first().click();
      cy.get('[data-testid="category-option"]').eq(2).click();

      cy.get('[data-testid="save-changes-button"]').click();
      cy.wait(2000);
    });
  });

  describe('Product List Display', () => {
    it('should display stock and price information', () => {
      cy.get('[data-testid="product-card"]').first().within(() => {
        // Check stock badge
        cy.get('[data-testid="stock-badge"]').should('contain', 'Stock:');
        
        // Check price display
        cy.get('[data-testid="retail-price"]').should('be.visible');
      });
    });

    it('should show low stock warning', () => {
      // This test assumes there's a product with low stock
      cy.get('[data-testid="product-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="stock-badge"]').then(($badge) => {
            const stockText = $badge.text();
            const stockNumber = parseInt(stockText.match(/\d+/)[0]);
            
            if (stockNumber < 10) {
              cy.wrap($badge).should('have.class', 'low-stock');
            }
          });
        });
      });
    });

    it('should format prices with decimals', () => {
      cy.get('[data-testid="retail-price"]').first().then(($price) => {
        const priceText = $price.text();
        // Check if price has decimal format (e.g., $29.99)
        expect(priceText).to.match(/\$\d+\.\d{2}/);
      });
    });
  });

  describe('Product Deletion for Discontinued Items', () => {
    it('should show delete button for discontinued products', () => {
      // First discontinue a product
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="discontinue-button"]').click();
      });
      cy.wait(1000);

      // Check if delete button appears
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="delete-button"]').should('be.visible');
      });
    });

    it('should show delete confirmation modal', () => {
      // Find a discontinued product and click delete
      cy.get('[data-testid="product-card"]').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('[data-testid="delete-button"]').then(($btn) => {
            if ($btn.length > 0) {
              cy.wrap($btn).click();
              return false; // Break the loop
            }
          });
        });
      });

      // Verify modal appears
      cy.get('[data-testid="delete-modal"]').should('be.visible');
      cy.contains('Delete Product').should('be.visible');
      cy.contains('This action cannot be undone').should('be.visible');

      // Cancel deletion
      cy.get('[data-testid="cancel-delete-button"]').click();
      cy.get('[data-testid="delete-modal"]').should('not.exist');
    });

    it('should delete product when confirmed', () => {
      let productTitle;

      // Get product title and delete it
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="product-title"]').then(($title) => {
          productTitle = $title.text();
        });
        
        cy.get('[data-testid="delete-button"]').then(($btn) => {
          if ($btn.length > 0) {
            cy.wrap($btn).click();
          }
        });
      });

      // Confirm deletion
      cy.get('[data-testid="confirm-delete-button"]').click();
      cy.wait(2000);

      // Verify product is removed
      cy.contains(productTitle).should('not.exist');
    });
  });

  describe('Color Selection Features', () => {
    it('should open color picker for primary color', () => {
      cy.get('[data-testid="add-product-button"]').click();
      cy.wait(1000);

      // Click primary color picker
      cy.get('[data-testid="primary-color-picker"]').click();
      
      // Verify color picker modal opens
      cy.get('[data-testid="color-picker-modal"]').should('be.visible');
      cy.contains('Choose Primary Color').should('be.visible');

      // Select a color
      cy.get('[data-testid="color-option"]').first().click();
      
      // Verify modal closes
      cy.get('[data-testid="color-picker-modal"]').should('not.exist');
    });

    it('should use camera for color capture', () => {
      cy.get('[data-testid="add-product-button"]').click();
      cy.wait(1000);

      cy.get('[data-testid="primary-color-picker"]').click();
      
      // Click camera button (will be mocked in test environment)
      cy.get('[data-testid="camera-color-button"]').click();
      
      // In a real test, this would mock the camera functionality
      // For now, just verify the button exists
      cy.get('[data-testid="camera-color-button"]').should('be.visible');
    });
  });

  describe('Category Management', () => {
    it('should filter products by category', () => {
      // Click category dropdown
      cy.get('[data-testid="category-dropdown"]').click();
      
      // Select a specific category
      cy.get('[data-testid="category-filter-option"]').first().click();
      cy.wait(1000);

      // Verify products are filtered
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
    });

    it('should show category count in dropdown', () => {
      cy.get('[data-testid="category-dropdown"]').click();
      
      cy.get('[data-testid="category-filter-option"]').each(($option) => {
        cy.wrap($option).within(() => {
          cy.get('[data-testid="category-count"]').should('be.visible');
        });
      });
    });
  });

  describe('Search Functionality', () => {
    it('should search products by title', () => {
      // Open search
      cy.get('[data-testid="search-button"]').click();
      
      // Type search query
      cy.get('[data-testid="search-input"]').type('Test');
      cy.wait(1000);

      // Verify filtered results
      cy.get('[data-testid="product-card"]').each(($card) => {
        cy.wrap($card).should('contain.text', 'Test');
      });

      // Clear search
      cy.get('[data-testid="close-search-button"]').click();
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Mock API failure
      cy.intercept('POST', '**/products', { statusCode: 500 }).as('createProductError');
      
      cy.get('[data-testid="add-product-button"]').click();
      cy.get('input[placeholder="Product title"]').type('Error Test Product');
      cy.get('[data-testid="save-product-button"]').click();
      
      cy.wait('@createProductError');
      
      // Verify error message appears
      cy.contains('Failed to create product').should('be.visible');
    });

    it('should validate required fields', () => {
      cy.get('[data-testid="add-product-button"]').click();
      
      // Try to save without required fields
      cy.get('[data-testid="save-product-button"]').click();
      
      // Verify validation message
      cy.contains('Product title is required').should('be.visible');
    });
  });
});
