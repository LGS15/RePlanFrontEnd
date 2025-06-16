describe('Home page', () => {
    it('displays landing title', () => {
        cy.visit('/')
        cy.contains('Team Sync')
    })
})