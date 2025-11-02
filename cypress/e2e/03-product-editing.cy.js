describe('VibrantKnots Admin - Product Editing', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login()
    cy.navigateToCollections()
    
    // Open first product for editing
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click()
    })
    cy.get('[data-testid="product-edit-screen"]').should('be.visible')
  })

  it('should edit basic product information', () => {
    // Edit title
    cy.get('[data-testid="title-input"]').clear().type('Updated Product Title')
    
    // Edit description
    cy.get('[data-testid="description-input"]').clear().type('Updated product description')
    
    // Edit material
    cy.get('[data-testid="material-input"]').clear().type('Cotton')
    
    // Edit pattern
    cy.get('[data-testid="pattern-input"]').clear().type('Floral')
    
    // Save changes
    cy.saveProduct()
    
    // Verify changes are saved
    cy.get('[data-testid="product-title"]').first().should('contain', 'Updated Product Title')
  })

  it('should update stock information', () => {
    // Navigate to stock section
    cy.get('[data-testid="stock-section"]').scrollIntoView()
    
    // Update stock values
    cy.updateStock(150, 20, 130)
    
    // Update reorder level
    cy.get('[data-testid="reorder-level-input"]').clear().type('25')
    
    // Update unit of measure
    cy.get('[data-testid="unit-measure-input"]').clear().type('meters')
    
    // Save changes
    cy.saveProduct()
    
    // Verify stock badge is updated
    cy.get('[data-testid="stock-badge"]').first().should('contain', '130')
  })

  it('should update pricing information', () => {
    // Navigate to pricing section
    cy.get('[data-testid="pricing-section"]').scrollIntoView()
    
    // Update retail price
    cy.get('[data-testid="retail-price-input"]').clear().type('199.99')
    
    // Update wholesale price
    cy.get('[data-testid="wholesale-price-input"]').clear().type('149.99')
    
    // Update currency
    cy.get('[data-testid="currency-input"]').clear().type('USD')
    
    // Save changes
    cy.saveProduct()
    
    // Verify price is updated
    cy.get('[data-testid="retail-price"]').first().should('contain', '$199.99')
  })

  it('should manage product variants', () => {
    // Navigate to variants section
    cy.get('[data-testid="variants-section"]').scrollIntoView()
    
    // Add new variant
    cy.addVariant('Red', '#FF0000', 'SKU-RED-001')
    
    // Add another variant
    cy.addVariant('Blue', '#0000FF', 'SKU-BLUE-001')
    
    // Verify variant preview colors
    cy.get('[data-testid="variant-color-preview"]').should('have.length', 2)
    cy.get('[data-testid="variant-color-preview"]').first().should('have.css', 'background-color', 'rgb(255, 0, 0)')
    
    // Remove a variant
    cy.get('[data-testid="remove-variant-button"]').first().click()
    cy.get('[data-testid="variant-item"]').should('have.length', 1)
    
    // Save changes
    cy.saveProduct()
    
    // Verify variant colors are displayed in product list
    cy.get('[data-testid="color-circle"]').should('have.length.greaterThan', 0)
  })

  it('should change product category', () => {
    // Navigate to category section
    cy.get('[data-testid="category-section"]').scrollIntoView()
    
    // Select different category
    cy.get('[data-testid="category-option"]').contains('Electronics').click()
    
    // Save changes
    cy.saveProduct()
    
    // Verify category badge is updated
    cy.get('[data-testid="category-badge"]').first().should('contain', 'Electronics')
  })

  it('should upload product images', () => {
    // Navigate to images section
    cy.get('[data-testid="images-section"]').scrollIntoView()
    
    // Click add image button
    cy.get('[data-testid="add-image-button"]').click()
    
    // Note: File upload testing would require fixture files
    // This is a placeholder for image upload functionality
    cy.get('[data-testid="image-upload-input"]').should('exist')
  })

  it('should validate required fields', () => {
    // Clear required field
    cy.get('[data-testid="title-input"]').clear()
    
    // Try to save
    cy.get('[data-testid="save-button"]').click()
    
    // Should show validation error or prevent save
    cy.get('[data-testid="product-edit-screen"]').should('be.visible')
  })

  it('should cancel editing and return to list', () => {
    // Make some changes
    cy.get('[data-testid="title-input"]').clear().type('Temporary Change')
    
    // Click back button
    cy.get('[data-testid="back-button"]').click()
    
    // Should return to collections screen
    cy.get('[data-testid="collections-screen"]').should('be.visible')
    
    // Changes should not be saved
    cy.get('[data-testid="product-title"]').first().should('not.contain', 'Temporary Change')
  })
})
