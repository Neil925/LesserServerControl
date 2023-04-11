const { GetAllServers, RequestServerStatus } = require('../axios');

module.exports = {
    commands: ['list'],
    permissionError: 'You need to have a valid role to run this command.',
    minArgs: 0,
    maxArgs: 0,
    callback: async (interaction, arguments, text) => {
        let servers = await GetAllServers();
        let message = "";

        if (servers == null) {
            interaction.reply('Data returned null. Either something went wrong or there are no minecraft servers.');
            return;
        }

        for (let server of servers) {
            let status = await RequestServerStatus(server.attributes.identifier);
            let name = server.attributes.name;
            let port = server.attributes.relationships.allocations.data[0].attributes.port;

            message += `**${name} (${port})**: ${status.data.attributes.current_state}\n`;
        }

        interaction.reply(message);
    },
    requiredRoles: []
}