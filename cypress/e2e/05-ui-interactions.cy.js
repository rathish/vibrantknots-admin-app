describe('VibrantKnots Admin - UI Interactions', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login()
    cy.navigateToCollections()
  })

  it('should show and hide search functionality', () => {
    // Search should be hidden initially
    cy.get('[data-testid="search-input"]').should('not.exist')
    
    // Click search button
    cy.get('[data-testid="search-button"]').click()
    cy.get('[data-testid="search-input"]').should('be.visible')
    
    // Click search button again to hide
    cy.get('[data-testid="search-button"]').click()
    cy.get('[data-testid="search-input"]').should('not.exist')
  })

  it('should open and close category dropdown', () => {
    // Dropdown should be closed initially
    cy.get('[data-testid="dropdown-menu"]').should('not.exist')
    
    // Click to open
    cy.get('[data-testid="category-dropdown"]').click()
    cy.get('[data-testid="dropdown-menu"]').should('be.visible')
    
    // Click outside to close
    cy.get('body').click(0, 0)
    cy.get('[data-testid="dropdown-menu"]').should('not.exist')
  })

  it('should show confirmation modal for discontinue action', () => {
    // Modal should not exist initially
    cy.get('[data-testid="confirm-modal"]').should('not.exist')
    
    // Click discontinue button
    cy.get('[data-testid="discontinue-button"]').first().click()
    
    // Modal should appear
    cy.get('[data-testid="confirm-modal"]').should('be.visible')
    cy.get('[data-testid="confirm-title"]').should('contain', 'Discontinue Product')
    cy.get('[data-testid="confirm-message"]').should('be.visible')
    cy.get('[data-testid="cancel-button"]').should('be.visible')
    cy.get('[data-testid="confirm-action-button"]').should('be.visible')
    
    // Cancel should close modal
    cy.get('[data-testid="cancel-button"]').click()
    cy.get('[data-testid="confirm-modal"]').should('not.exist')
  })

  it('should display product variant colors correctly', () => {
    // Check if variant colors are displayed as circles
    cy.get('[data-testid="variant-colors"]').first().within(() => {
      cy.get('[data-testid="color-circle"]').should('have.length.greaterThan', 0)
      
      // Check circle styling
      cy.get('[data-testid="color-circle"]').first().should('have.css', 'border-radius', '10px')
      cy.get('[data-testid="color-circle"]').first().should('have.css', 'width', '20px')
      cy.get('[data-testid="color-circle"]').first().should('have.css', 'height', '20px')
    })
  })

  it('should show stock and category badges correctly', () => {
    cy.get('[data-testid="product-card"]').first().within(() => {
      // Check badge row
      cy.get('[data-testid="badge-row"]').should('be.visible')
      
      // Check stock badge
      cy.get('[data-testid="stock-badge"]').should('be.visible')
      cy.get('[data-testid="stock-badge"]').should('contain', 'Stock:')
      
      // Check category badge
      cy.get('[data-testid="category-badge"]').should('be.visible')
    })
  })

  it('should display prices with currency symbols', () => {
    cy.get('[data-testid="price-container"]').first().within(() => {
      // Should show retail price with currency symbol
      cy.get('[data-testid="retail-price"]').should('be.visible')
      cy.get('[data-testid="retail-price"]').should('match', /[$₹€£¥]/)
      
      // Should show wholesale price with currency symbol
      cy.get('[data-testid="wholesale-price"]').should('be.visible')
      cy.get('[data-testid="wholesale-price"]').should('match', /[$₹€£¥]/)
    })
  })

  it('should handle disabled state for discontinued products', () => {
    // First discontinue a product
    cy.get('[data-testid="discontinue-button"]').first().click()
    cy.get('[data-testid="confirm-action-button"]').click()
    
    // Check discontinued product styling
    cy.get('[data-testid="product-card"]').first().should('have.class', 'discontinued')
    cy.get('[data-testid="discontinued-tag"]').should('be.visible')
    
    // Share button should be disabled
    cy.get('[data-testid="share-button"]').first().should('have.class', 'disabled')
    
    // Edit button should still be enabled
    cy.get('[data-testid="edit-button"]').first().should('not.have.class', 'disabled')
  })

  it('should show loading states appropriately', () => {
    // Reload page to see loading state
    cy.reload()
    cy.login()
    cy.navigateToCollections()
    
    // Should show loading indicator
    cy.get('[data-testid="loading-indicator"]').should('be.visible')
    cy.get('[data-testid="loading-text"]').should('contain', 'Loading products')
    
    // Loading should disappear after data loads
    cy.get('[data-testid="loading-indicator"]', { timeout: 10000 }).should('not.exist')
    cy.get('[data-testid="product-card"]').should('be.visible')
  })

  it('should handle empty states correctly', () => {
    // Filter by a category that has no products
    cy.filterByCategory('Electronics')
    
    // If no products, should show empty state
    cy.get('[data-testid="product-card"]').then(($cards) => {
      if ($cards.length === 0) {
        cy.get('[data-testid="empty-state"]').should('be.visible')
        cy.get('[data-testid="empty-title"]').should('contain', 'No Products Found')
      }
    })
  })

  it('should maintain scroll position and state', () => {
    // Scroll down
    cy.scrollTo('bottom')
    
    // Open product edit
    cy.get('[data-testid="product-card"]').last().within(() => {
      cy.get('[data-testid="edit-button"]').click()
    })
    
    // Go back
    cy.get('[data-testid="back-button"]').click()
    
    // Should maintain some scroll position (not necessarily exact)
    cy.window().its('scrollY').should('be.greaterThan', 0)
  })

  it('should handle responsive design elements', () => {
    // Test different viewport sizes
    cy.viewport(768, 1024) // Tablet
    cy.get('[data-testid="product-card"]').should('be.visible')
    
    cy.viewport(375, 667) // Mobile
    cy.get('[data-testid="product-card"]').should('be.visible')
    
    cy.viewport(1920, 1080) // Desktop
    cy.get('[data-testid="product-card"]').should('be.visible')
  })
})
