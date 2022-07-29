const { prefix, validRoles } = require('../config.json');

const validatePermissions = (permissions) => {
    const validPermissions = [
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'ADMINISTRATOR',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS_AND_STICKERS',
        'USE_APPLICATION_COMMANDS',
        'REQUEST_TO_SPEAK',
        'MANAGE_EVENTS',
        'MANAGE_THREADS',
        'CREATE_PUBLIC_THREADS',
        'CREATE_PRIVATE_THREADS',
        'USE_EXTERNAL_STICKERS',
        'SEND_MESSAGES_IN_THREADS',
        'USE_EMBEDDED_ACTIVITIES',
        'MODERATE_MEMBERS'
    ]

    for (const permission of permissions) {
        if (!validPermissions.includes(permission)) {
            throw new Error(`Unkwon permssion node "${permission}"`);
        }
    }
}

module.exports = (client, commandOptions) => {
    let {
        commands,
        expectedArgs = '',
        permissionError = 'You do not have permission to run this command.',
        minArgs = 0,
        maxArgs = null,
        permissions = [],
        requiredRoles = validRoles,
        callback
    } = commandOptions;

    //Ensure the command and aliases are in an array
    if (typeof commands === 'string') {
        commands = [commands];
    }

    console.log(commands);
    console.log(`Registering command "${commands[0]}"`);

    //Ensure the permissions are in an array and are all valid
    if (permissions.length) {
        if (typeof permissions === 'string') {
            permissions = [permissions];
        }

        validatePermissions(permissions);
    }

    client.on('messageCreate', async interaction => {
        const { member, content, guild } = interaction;

        for (const alias of commands) {
            if (content.toLowerCase().startsWith(`${prefix}${alias.toLowerCase()}`)) {
                // A command has ran

                for (const permission of permissions) {
                    if (!member.hasPermission(permission)) {
                        interaction.reply(permissionError);
                        return;
                    }
                }

                // Ensure the user has the required roles.
                for (const requiredRole of requiredRoles) {
                    let roles = await guild.roles.fetch();

                    const role = roles.find(x => x.id == requiredRole);

                    if (role && member.roles.cache.some(x => x.id == role)) {
                        break;
                    }

                    interaction.reply('You do not have a valid role to run this command.');
                }

                // Split on any number of spaces
                const arguments = content.split(/[ ]+/);

                // Remove the command which is the first index
                arguments.shift();

                // Ensure we have the correct number of arguemnts
                if (arguments.length < minArgs || (maxArgs !== null && arguments.length > maxArgs)) {
                    interaction.reply(`Incorrect syntax! Use ${prefix}${alias} ${expectedArgs}`);
                    return;
                }

                //Handle the custom command code
                callback(interaction, arguments, arguments.join(' '));

                return;
            }
        }
    })
}