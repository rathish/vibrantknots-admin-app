describe('VibrantKnots Admin - Product Management', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.login()
    cy.navigateToCollections()
  })

  it('should display product list with all elements', () => {
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    
    // Check product card elements
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="stock-badge"]').should('be.visible')
      cy.get('[data-testid="category-badge"]').should('be.visible')
      cy.get('[data-testid="product-title"]').should('be.visible')
      cy.get('[data-testid="product-description"]').should('be.visible')
      cy.get('[data-testid="variant-colors"]').should('be.visible')
      cy.get('[data-testid="price-container"]').should('be.visible')
      cy.get('[data-testid="edit-button"]').should('be.visible')
      cy.get('[data-testid="share-button"]').should('be.visible')
      cy.get('[data-testid="discontinue-button"]').should('be.visible')
    })
  })

  it('should filter products by category', () => {
    // Open category dropdown
    cy.get('[data-testid="category-dropdown"]').click()
    cy.get('[data-testid="dropdown-menu"]').should('be.visible')
    
    // Select a category
    cy.get('[data-testid="category-option"]').contains('Fabrics').click()
    
    // Verify filtering
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="category-badge"]').each(($badge) => {
      cy.wrap($badge).should('contain', 'Fabrics')
    })
  })

  it('should search products', () => {
    // Open search
    cy.get('[data-testid="search-button"]').click()
    cy.get('[data-testid="search-input"]').should('be.visible')
    
    // Search for a product
    cy.get('[data-testid="search-input"]').type('Golden')
    
    // Verify search results
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="product-title"]').each(($title) => {
      cy.wrap($title).should('contain.text', 'Golden')
    })
  })

  it('should open product edit screen', () => {
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="edit-button"]').click()
    })
    
    cy.get('[data-testid="product-edit-screen"]').should('be.visible')
    cy.get('[data-testid="edit-header-title"]').should('contain', 'Edit Product')
  })

  it('should discontinue and enable products', () => {
    // Click discontinue button
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="discontinue-button"]').click()
    })
    
    // Confirm in modal
    cy.get('[data-testid="confirm-modal"]').should('be.visible')
    cy.get('[data-testid="confirm-action-button"]').click()
    
    // Verify product is discontinued
    cy.get('[data-testid="product-card"]').first().should('have.class', 'discontinued')
    cy.get('[data-testid="discontinued-tag"]').should('be.visible')
    
    // Enable product back
    cy.get('[data-testid="product-card"]').first().within(() => {
      cy.get('[data-testid="discontinue-button"]').should('contain', 'Enable').click()
    })
    
    cy.get('[data-testid="confirm-modal"]').should('be.visible')
    cy.get('[data-testid="confirm-action-button"]').click()
  })
})
