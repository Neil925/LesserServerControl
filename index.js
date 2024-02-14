const path = require('path');
const fs = require('fs');
const { discordToken, modules } = require('./config.json');
const { Client, GatewayIntentBits, EmbedBuilder, ChannelType, Partials } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageTyping], partials: [Partials.Channel, Partials.Message] });

var lastVoiceStateUpdate = 0;

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`)

    const baseFile = 'command-base.js';
    const commandBase = require(`./commands/${baseFile}`);

    const readCommands = dir => {
        const files = fs.readdirSync(path.join(__dirname, dir));
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, dir, file));
            if (stat.isDirectory()) {
                readCommands(path.join(dir, file));
            } else if (file !== baseFile) {
                const option = require(path.join(__dirname, dir, file));
                commandBase(client, option);
            }
        }
    }

    readCommands('commands');
});

client.on('messageCreate', async ev => {
    if (ev.author.bot)
        return;

    if (modules.dmLogger.enabled && ev.channel.isDMBased()) {
        let channel = await (await client.guilds.fetch(modules.dmLogger.guild)).channels.fetch(modules.dmLogger.channelid);
        await channel.send(`<@!${ev.author.id}>: ${ev.content}`);
    }

    if (!modules.outOfContext.enabled || ev.channel.id != modules.outOfContext.channelid)
        return;

    let text = ev.content;
    await ev.delete();
    await ev.channel.send(text);
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (!modules.transendence.enabled)
        return;

    if (oldMember.nickname == newMember.nickname)
        return;

    let channel = await newMember.guild.channels.fetch('1024154228186427432');

    if (newMember.nickname == "Neil" && oldMember.nickname != "Neil") {
        await newMember.roles.add("696587541066940498");
        await channel.send(`<@!${newMember.id}> has been transcended!`);
        return;
    }

    if (oldMember.nickname == "Neil" && newMember.nickname != "Neil") {
        await newMember.roles.remove("696587541066940498");
        await channel.send(`<@!${newMember.id}> has fallen from grace!`);
        return;
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (!modules.voiceChannelAlert.enabled ||
        oldState.channel?.members?.size == newState.channel?.members?.size)
        return;

    let { channelId, messageId, minutesCoolDown, alertText, rolePingId } = modules.voiceChannelAlert;

    let channel = await newState.guild.channels.fetch(channelId);
    let statusMessage = await channel.messages.fetch(messageId);

    if (oldState.channel == null && newState.channel?.members?.size == 1
        && Date.now() > lastVoiceStateUpdate + (minutesCoolDown * 60000)) {
        let alert = await channel.send(alertText
            .replace("{role}", `<@&${rolePingId}>`)
            .replace("{channel}", `${newState.channel}`));

        setTimeout(async () => await alert.delete(), 60000);

        lastVoiceStateUpdate = Date.now();
    }

    var fields = [];

    newState.guild.channels.cache.filter(x => x.type === ChannelType.GuildVoice && x.members.size != 0)
        .forEach(x => {
            let message = "";
            x.members.forEach((user) => message += `${user.displayName}\n`);

            fields.push({ name: `**${x}**`, value: message, inline: true })
        });

    const embed = new EmbedBuilder().addFields(fields).setTitle("Voice Chat Status");

    if (fields.length == 0)
        embed.setDescription("All voice chats are empty...");

    await statusMessage.edit({ content: "", embeds: [embed] });
});

client.login(discordToken);