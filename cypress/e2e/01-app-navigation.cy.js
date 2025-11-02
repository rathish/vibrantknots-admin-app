describe('VibrantKnots Admin App - Navigation', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should load the app and show login screen', () => {
    cy.get('[data-testid="login-screen"]').should('be.visible')
    cy.contains('VibrantKnots Admin').should('be.visible')
  })

  it('should navigate to main app after login', () => {
    cy.login()
    cy.get('[data-testid="main-screen"]').should('be.visible')
    cy.get('[data-testid="tab-bar"]').should('be.visible')
  })

  it('should navigate between tabs', () => {
    cy.login()
    
    // Test Collections tab
    cy.get('[data-testid="tab-Collections"]').click()
    cy.get('[data-testid="collections-screen"]').should('be.visible')
    
    // Test Camera tab
    cy.get('[data-testid="tab-Camera"]').click()
    cy.get('[data-testid="camera-screen"]').should('be.visible')
    
    // Test Marketing tab
    cy.get('[data-testid="tab-Marketing"]').click()
    cy.get('[data-testid="marketing-screen"]').should('be.visible')
    
    // Test Media Content tab
    cy.get('[data-testid="tab-Media Content"]').click()
    cy.get('[data-testid="media-content-screen"]').should('be.visible')
    
    // Test Inbox tab
    cy.get('[data-testid="tab-Inbox"]').click()
    cy.get('[data-testid="inbox-screen"]').should('be.visible')
  })

  it('should show loading state while fetching data', () => {
    cy.login()
    cy.navigateToCollections()
    
    // Should show loading indicator initially
    cy.get('[data-testid="loading-indicator"]').should('be.visible')
    
    // Should hide loading after data loads
    cy.get('[data-testid="loading-indicator"]', { timeout: 10000 }).should('not.exist')
  })
})
