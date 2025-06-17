describe('Auth validation', () => {
    beforeEach(() => {
        cy.visit('/auth')
        cy.contains("Don't have an account? Sign up").click()
    })

    it('shows error when passwords do not match', () => {
        cy.get('input[name="email"]').type('test@example.com')
        cy.get('input[name="username"]').type('tester')
        cy.get('input[name="password"]').type('secret123')
        cy.get('input[name="confirmPassword"]').type('secret321')
        cy.contains('button', 'Sign Up').click()
        cy.contains('Passwords do not match')
    })

    it('shows error for short password', () => {
        cy.get('input[name="email"]').type('short@example.com')
        cy.get('input[name="username"]').type('shorter')
        cy.get('input[name="password"]').type('123')
        cy.get('input[name="confirmPassword"]').type('123')
        cy.contains('button', 'Sign Up').click()
        cy.contains('Password must be at least 6 characters')
    })

    it('can toggle back to sign in form', () => {
        cy.contains('Already have an account? Sign in').click()
        cy.contains('Sign in to your account')
    })
})