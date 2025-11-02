// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in command log
Cypress.on('window:before:load', (win) => {
  cy.stub(win.console, 'error').as('consoleError')
  cy.stub(win.console, 'warn').as('consoleWarn')
})

// Custom commands for VibrantKnots app
Cypress.Commands.add('waitForAppLoad', () => {
  cy.get('[data-testid="app-container"]', { timeout: 15000 }).should('be.visible')
})

Cypress.Commands.add('navigateToCollections', () => {
  cy.get('[data-testid="tab-Collections"]').click()
  cy.get('[data-testid="collections-screen"]').should('be.visible')
})
