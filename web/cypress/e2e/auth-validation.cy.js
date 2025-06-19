describe('Auth validation', () => {
    beforeEach(() => {
        cy.visit('/auth')
        cy.contains("Don't have an account? Sign up").click()
    })

    it('shows error when passwords do not match', () => {
        cy.get('[data-cy="auth-email"]').type('test@example.com')
        cy.get('[data-cy="auth-username"]').type('tester')
        cy.get('[data-cy="auth-password"]').type('secret123')
        cy.get('[data-cy="auth-confirm-password"]').type('secret321')
        cy.contains('button', 'Sign Up').click()
        cy.contains('Passwords do not match')
    })

    it('shows error for short password', () => {
        cy.get('[data-cy="auth-email"]').type('short@example.com')
        cy.get('[data-cy="auth-username"]').type('shorter')
        cy.get('[data-cy="auth-password"]').type('123')
        cy.get('[data-cy="auth-confirm-password"]').type('123')
        cy.contains('button', 'Sign Up').click()
        cy.contains('Password must be at least 6 characters')
    })

    it('can toggle back to sign in form', () => {
        cy.contains('Already have an account? Sign in').click()
        cy.contains('Sign in to your account')
    })
})