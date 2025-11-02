describe('VibrantKnots Admin - API Integration', () => {
  beforeEach(() => {
    // Intercept API calls
    cy.intercept('GET', 'http://localhost:8000/products').as('getProducts')
    cy.intercept('GET', 'http://localhost:8000/categories').as('getCategories')
    cy.intercept('PUT', 'http://localhost:8000/products/*').as('updateProduct')
    cy.intercept('POST', 'http://localhost:8000/products/*/stock').as('updateStock')
    cy.intercept('POST', 'http://localhost:8000/products/*/variants').as('createVariant')
    cy.intercept('POST', 'http://localhost:8000/products/*/disable').as('disableProduct')
    cy.intercept('POST', 'http://localhost:8000/products/*/enable').as('enableProduct')
    
    cy.visit('/')
    cy.login()
  })

  it('should load products from API', () => {
    cy.navigateToCollections()
    
    // Wait for API call
    cy.wait('@getProducts').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
      expect(interception.response.body).to.be.an('array')
    })
    
    // Verify products are displayed
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
  })

  it('should load categories from API', () => {
    cy.navigateToCollections()
    
    // Wait for API call
    cy.wait('@getCategories').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
      expect(interception.response.body).to.be.an('array')
    })
    
    // Open category dropdown to verify categories loaded
    cy.get('[data-testid="category-dropdown"]').click()
    cy.get('[data-testid="category-option"]').should('have.length.greaterThan', 1)
  })

  it('should handle API errors gracefully', () => {
    // Intercept with error response
    cy.intercept('GET', 'http://localhost:8000/products', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('getProductsError')
    
    cy.navigateToCollections()
    
    // Wait for error response
    cy.wait('@getProductsError')
    
    // Should show error state
    cy.get('[data-testid="error-state"]').should('be.visible')
    cy.get('[data-testid="error-message"]').should('contain', 'Error Loading Products')
  })

  it('should save product changes via API', () => {
    cy.navigateToCollections()
    cy.wait('@getProducts')
    
    // Edit product
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click()
    })
    
    // Make changes
    cy.get('[data-testid="title-input"]').clear().type('API Test Product')
    
    // Save
    cy.get('[data-testid="save-button"]').click()
    
    // Verify API call was made
    cy.wait('@updateProduct').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201])
      expect(interception.request.body).to.have.property('title', 'API Test Product')
    })
  })

  it('should save stock changes via API', () => {
    cy.navigateToCollections()
    cy.wait('@getProducts')
    
    // Edit product
    cy.openProductEdit('Golden Silk Fabric')
    
    // Update stock
    cy.updateStock(200, 30, 170)
    
    // Save
    cy.saveProduct()
    
    // Verify stock API call
    cy.wait('@updateStock').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201])
      expect(interception.request.body).to.have.property('current_stock', 200)
      expect(interception.request.body).to.have.property('reserved_stock', 30)
    })
  })

  it('should create variants via API', () => {
    cy.navigateToCollections()
    cy.wait('@getProducts')
    
    // Edit product
    cy.openProductEdit('Golden Silk Fabric')
    
    // Add variant
    cy.addVariant('Green', '#00FF00', 'SKU-GREEN-001')
    
    // Save
    cy.saveProduct()
    
    // Verify variant API call
    cy.wait('@createVariant').then((interception) => {
      expect(interception.response.statusCode).to.be.oneOf([200, 201])
      expect(interception.request.body).to.have.property('color', 'Green')
      expect(interception.request.body).to.have.property('color_code', '#00FF00')
    })
  })

  it('should disable/enable products via API', () => {
    cy.navigateToCollections()
    cy.wait('@getProducts')
    
    // Disable product
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="discontinue-button"]').click()
    })
    
    cy.get('[data-testid="confirm-action-button"]').click()
    
    // Verify disable API call
    cy.wait('@disableProduct').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
    
    // Enable product
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="discontinue-button"]').should('contain', 'Enable').click()
    })
    
    cy.get('[data-testid="confirm-action-button"]').click()
    
    // Verify enable API call
    cy.wait('@enableProduct').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
  })

  it('should refresh data when marked dirty', () => {
    cy.navigateToCollections()
    cy.wait('@getProducts')
    
    // Edit and save product to mark dirty
    cy.openProductEdit('Golden Silk Fabric')
    cy.get('[data-testid="title-input"]').clear().type('Dirty Flag Test')
    cy.saveProduct()
    
    // Should trigger another products API call due to dirty flag
    cy.wait('@getProducts').then((interception) => {
      expect(interception.response.statusCode).to.equal(200)
    })
  })
})
