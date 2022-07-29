const { SendSignal, GetServerFromPort } = require('../axios');

module.exports = {
    commands: ["stop"],
    expectedArgs: "<port>",
    premissionError: "You need to have a valid role to run this command.",
    minArgs: 1,
    maxArgs: 1,
    callback: async (interaction, arguments) => {
        const port = arguments[0];
        let signal = "stop";

        if (interaction.channelId != "791113683521634304")
            return;

        let server = await GetServerFromPort(port);

        let identifier = server.attributes.identifier;
        if (identifier == null || identifier == undefined) {
            await interaction.reply("Error. Could not find server corrosponding to that port.");
            return;
        }

        try {
            await SendSignal(identifier, signal);
        } catch (err) {
            console.log(err);
            return;
        }

        interaction.reply(`Signal \`stop\` has been sucessfully sent to server ${server.attributes.name}.`);
    },
}