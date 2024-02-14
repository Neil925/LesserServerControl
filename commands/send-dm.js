module.exports = {
    commands: ["senddm", "send", "dm", "message", "pm"],
    expectedArgs: "<userid> <message>",
    requiredRoles: ["697860923767128087"],
    premissionError: "You can't use this command.",
    minArgs: 2,
    maxArgs: 1000,
    callback: async (interaction, arguments) => {
        let userId = arguments[0].replace("<", "").replace(">", "").replace("@", "").replace("&", "").replace("!", "");
        let message = arguments.slice(1).join(' ');

        let user = await interaction.guild.members.fetch(userId);
        await user.send(message);
        await interaction.delete();
    },
}