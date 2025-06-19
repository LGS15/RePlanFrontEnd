describe('Team creation and deletion', () => {
    it('can create and delete a team', () => {
        cy.intercept('POST', 'http://localhost:8080/teams', {
            statusCode: 201,
            body: { teamId: 1, teamName: 'Test Team', gameName: 'valorant', ownerId: '123' }
        }).as('createTeam')

        cy.intercept('GET', 'http://localhost:8080/teams/owner/123', {
            statusCode: 200,
            body: [{ teamId: 1, teamName: 'Test Team', gameName: 'valorant', ownerId: '123' }]
        }).as('getTeams')

        cy.intercept('DELETE', 'http://localhost:8080/teams/1', {
            statusCode: 200,
            body: {}
        }).as('deleteTeam')

        cy.clock()
        cy.visit('/team-management', {
            onBeforeLoad(win) {
                win.localStorage.setItem('token', 'fake-token')
                win.localStorage.setItem('userId', '123')
                win.localStorage.setItem('username', 'tester')
                win.localStorage.setItem('email', 'tester@example.com')
            }
        })

        cy.get('[data-cy="team-name"]').type('Test Team')
        cy.get('[data-cy="game-name"]').select('valorant')
        cy.get('[data-cy="create-team-btn"]').click()

        cy.wait('@createTeam')
        cy.contains('Team created successfully!')

        cy.get('button[data-tab="manage"]').click()
        cy.wait('@getTeams')
        cy.contains('Test Team')

        cy.on('window:confirm', () => true)
        cy.get('[data-cy="delete-team-btn"]').click()
        cy.wait('@deleteTeam')
        cy.contains('Team deleted successfully!')
    })
})