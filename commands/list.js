module.exports = {
    commands: ['list'],
    expectedArgs: '',
    permissionError: 'You need to have a valid role to run this command.',
    minArgs: 0,
    maxArgs: 0,
    callback: (message, arguments, text) => {
        //List servers
    },
    permissions: [],
    requiredRoles: []
}