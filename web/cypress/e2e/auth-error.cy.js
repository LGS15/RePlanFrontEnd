describe('Auth errors', () => {
    it('displays error for invalid login', () => {
        cy.intercept('POST', 'http://localhost:8080/users/login', {
            statusCode: 401,
            body: { message: 'Authentication failed' }
        })
        cy.visit('/auth')
        cy.get('[data-cy="auth-email"]').type('wrong@example.com')
        cy.get('[data-cy="auth-password"]').type('badpass')
        cy.contains('button', 'Sign In').click()
        cy.contains('Authentication failed')
    })

    it('shows error when registering with existing account', () => {
        cy.intercept('POST', 'http://localhost:8080/users/register', {
            statusCode: 409,
            body: { message: 'Email or username already exists' }
        })
        cy.visit('/auth')
        cy.contains("Don't have an account? Sign up").click()
        cy.get('[data-cy="auth-email"]').type('existing@example.com')
        cy.get('[data-cy="auth-username"]').type('tester')
        cy.get('[data-cy="auth-password"]').type('secret123')
        cy.get('[data-cy="auth-confirm-password"]').type('secret123')
        cy.contains('button', 'Sign Up').click()
        cy.contains('Email or username already exists')
    })
})