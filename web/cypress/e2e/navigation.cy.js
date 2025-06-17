describe('Navigation', () => {
    it('navigates to auth page via Sign Up link', () => {
        cy.visit('/')
        cy.contains('Sign Up').click()
        cy.url().should('include', '/auth')
        cy.contains('Sign in to your account')
    })

    it('redirects to auth when visiting Team Management without login', () => {
        cy.visit('/')
        cy.contains('Team Management').click()
        cy.url().should('include', '/auth')
    })
})

describe('Auth Page', () => {
    it('toggles between sign in and sign up forms', () => {
        cy.visit('/auth')
        cy.contains("Don't have an account? Sign up").click()
        cy.contains('Create an account')
    })
})