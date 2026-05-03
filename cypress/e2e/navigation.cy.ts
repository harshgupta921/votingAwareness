describe('Navigation', () => {
  it('should navigate to the assistant page', () => {
    cy.visit('http://localhost:3000/');
    cy.get('a[href*="/assistant"]').first().click();
    cy.url().should('include', '/assistant');
    cy.get('h2').contains('VoteIndia Assistant');
  });
});
