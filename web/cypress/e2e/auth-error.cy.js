describe('Auth errors', () => {
    it('displays error for invalid login', () => {
        cy.intercept('POST', 'http://localhost:8080/users/login', {
            statusCode: 401,
            body: { message: 'Invalid credentials' }
        })
        cy.visit('/auth')
        cy.get('input[name="email"]').type('wrong@example.com')
        cy.get('input[name="password"]').type('badpass')
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
        cy.get('input[name="email"]').type('existing@example.com')
        cy.get('input[name="username"]').type('tester')
        cy.get('input[name="password"]').type('secret123')
        cy.get('input[name="confirmPassword"]').type('secret123')
        cy.contains('button', 'Sign Up').click()
        cy.contains('Email or username already exists')
    })
})