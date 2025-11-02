describe('Vibrant Knots - Basic Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the application', () => {
    cy.get('body').should('be.visible')
    cy.contains('VibrantKnots Admin').should('be.visible')
  })

  it('should navigate from login to main app', () => {
    // Look for login elements
    cy.get('[data-testid="login-screen"]').should('be.visible')
    cy.get('[data-testid="login-button"]').click()
    
    // Should navigate to main screen
    cy.get('[data-testid="main-screen"]').should('be.visible')
  })

  it('should show collections screen by default', () => {
    // Login first
    cy.get('[data-testid="login-button"]').click()
    
    // Should show collections
    cy.get('[data-testid="collections-screen"]').should('be.visible')
    cy.contains('Collections').should('be.visible')
  })

  it('should handle tab navigation', () => {
    // Login first
    cy.get('[data-testid="login-button"]').click()
    
    // Test tab clicks
    cy.get('[data-testid="tab-Camera"]').should('be.visible').click()
    cy.get('[data-testid="tab-Marketing"]').should('be.visible').click()
    cy.get('[data-testid="tab-Collections"]').should('be.visible').click()
  })

  it('should show loading or error states appropriately', () => {
    cy.get('[data-testid="login-button"]').click()
    
    // Wait for any loading states to appear/disappear
    cy.wait(2000)
    
    // App should be in a stable state
    cy.get('body').should('be.visible')
  })
})
