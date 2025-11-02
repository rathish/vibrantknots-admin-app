// Custom commands for VibrantKnots admin app

// Login command
Cypress.Commands.add('login', () => {
  cy.visit('/')
  cy.get('[data-testid="login-screen"]').should('be.visible')
  cy.get('[data-testid="login-button"]').click()
})

// Product management commands
Cypress.Commands.add('openProductEdit', (productTitle) => {
  cy.contains('[data-testid="product-card"]', productTitle)
    .find('[data-testid="edit-button"]')
    .click()
  cy.get('[data-testid="product-edit-screen"]').should('be.visible')
})

Cypress.Commands.add('addVariant', (color, colorCode, sku) => {
  cy.get('[data-testid="add-variant-button"]').click()
  cy.get('[data-testid="variant-color-input"]').last().type(color)
  cy.get('[data-testid="variant-color-code-input"]').last().type(colorCode)
  cy.get('[data-testid="variant-sku-input"]').last().type(sku)
})

Cypress.Commands.add('saveProduct', () => {
  cy.get('[data-testid="save-button"]').click()
  cy.get('[data-testid="collections-screen"]').should('be.visible')
})

// Category filter commands
Cypress.Commands.add('filterByCategory', (categoryName) => {
  cy.get('[data-testid="category-dropdown"]').click()
  cy.get('[data-testid="category-option"]').contains(categoryName).click()
})

// Stock management commands
Cypress.Commands.add('updateStock', (currentStock, reservedStock, availableStock) => {
  if (currentStock) {
    cy.get('[data-testid="current-stock-input"]').clear().type(currentStock.toString())
  }
  if (reservedStock) {
    cy.get('[data-testid="reserved-stock-input"]').clear().type(reservedStock.toString())
  }
  if (availableStock) {
    cy.get('[data-testid="available-stock-input"]').clear().type(availableStock.toString())
  }
})
