const { discordToken, pteroUrl, pteroToken, validRoles, prefix } = require('./config.json');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const axios = require('axios').default;
const PREFIX = prefix;

axios.defaults.baseURL = pteroUrl;
axios.defaults.headers.common['Authorization'] = `Bearer ${pteroToken}`;
axios.defaults.headers.common['Content-Type'] = "application/json";
axios.defaults.headers.common['Accept'] = "application/json";

var interval;
var seconds = 0;

client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

client.on('messageCreate', async interaction => {
    if (interaction.author.bot)
        return;

    if (interaction.channelId != "791113683521634304")
        return;

    if (!interaction.content.startsWith(PREFIX))
        return;

    let guild = await client.guilds.fetch("696587333453086740");
    let user = await guild.members.fetch(interaction.author.id);

    let flag = false;

    for (const role of user.roles.cache) {
        if (validRoles.includes(role[0]))
            flag = true;
    }

    if (!flag)
        return;

    let command = interaction.content.split(" ");

    if (command.length < 2) {
        await interaction.reply("Please pass an argument for the port. Example: `m!start 25566`");
        return;
    }

    let server = await GetServerFromPort(command[1]);

    let identifier = server.attributes.identifier;

    if (identifier == null || identifier == undefined) {
        await interaction.reply("Error. Could not find server corrosponding to that port.");
        return;
    }

    let signal = command[0].replace("m!", "");

    if (signal.toLowerCase().includes("kill")) {
        interaction.reply("You may not send a kill signal to the server. If the server is experiencing an issue, please contact <@&1001907000927604767>.");
        return;
    }

    try {
        await SendSignal(identifier, signal);
    } catch (error) {
        await interaction.reply("Something went wrong with sending the signal. <@!405283740533915649>");
        console.error(error);
        return;
    }

    if (signal == "stop") {
        await interaction.reply(`Signal \`stop\` has been sucessfully sent to server ${server.attributes.name}.`);
        return;
    }

    let message = await interaction.reply(`Signal \`${signal}\` has been sucessfully sent to server ${server.attributes.name}.\nAwaiting startup.`);

    interval = setInterval(async function () {
        let status = await RequestServerStatus(identifier);

        if (status == null) {
            stopInterval();
            return;
        }

        if (status.data.attributes.current_state == "running") {
            await message.edit(`${message.content.split('\n')[0]}\nServer is now online!`);
            stopInterval();
            return;
        }

        seconds++;

        if (seconds % 3 == 0) {
            if (message.content.endsWith('. . .'))
                await message.edit(message.content.replace('. . .', '.'));
            else
                await message.edit(`${message.content} .`);
        }
    }, 1000);
});

async function GetServerFromPort(port) {
    try {
        let response = await axios.get("/api/client");
        let server = response.data.data.find(x => x.attributes.relationships.allocations.data.some((item) => item.attributes.port == port));
        return server;
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function SendSignal(server, state) {
    await axios.post(`/api/client/servers/${server}/power`, { signal: state });
}

async function RequestServerStatus(server) {
    try {
        return await axios.get(`/api/client/servers/${server}/resources`);
    } catch (error) {
        console.error(error);
        return null;
    }
}

function stopInterval() {
    clearInterval(interval);
}

client.login(discordToken);