const { validRoles } = require('../config.json');
const { SendSignal, RequestServerStatus, GetServerFromPort } = require('../axios');

module.exports = {
    commands: ["restart"],
    requiredRoles: validRoles,
    expectedArgs: "<restart>",
    premissionError: "You need to have a valid role to run this command.",
    minArgs: 1,
    maxArgs: 1,
    callback: async (interaction, arguments) => {
        const port = arguments[0];
        let signal = "restart";
        let interval;
        let seconds = 0;

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

        let reply = await interaction.reply(`Signal \`${signal}\` has been sucessfully sent to server ${server.attributes.name}.\nAwaiting restart.`)

        interval = setInterval(async function () {
            let status = await RequestServerStatus(identifier);

            if (status == null) {
                clearInterval(interval);
                return;
            }

            if (status.data.attributes.current_state == "running") {
                await reply.edit(`${reply.content.split('\n')[0]}\nServer is now online!`);
                clearInterval(interval);
                return;
            }

            seconds++;

            if (seconds % 3 == 0) {
                if (reply.content.endsWith('. . .'))
                    await reply.edit(reply.content.replace('. . .', '.'));
                else
                    await reply.edit(`${reply.content} .`);
            }
        }, 1000);
    },
}