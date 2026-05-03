describe('Basic Flow', () => {
  it('should load the home page and navigate to the assistant', () => {
    // Start at the home page
    cy.visit('/');

    // Check if the logo is present
    cy.contains('VoteIndia').should('be.visible');

    // Click on the Assistant link in the navbar
    cy.get('nav').contains('Assistant').click();

    // Should navigate to /assistant
    cy.url().should('include', '/assistant');

    // Check if the chat input is visible
    cy.get('textarea').should('be.visible');
  });

  it('should show language options', () => {
    cy.visit('/');
    cy.get('button[aria-label^="Current language"]').click();
    cy.contains('हिंदी (Hindi)').should('be.visible');
  });
});
