import { Client } from "discord.js";
import config from "../config.json" with { type: "json" };

const { autoRole } = config.modules;

export default class AutoAssignRoleModule {
  registerEvent = (client: Client) => {
    if (!autoRole.enabled) {
      console.log("Auto assign role module is disabled");
      return;
    }

    console.log("Registering auto assign role module");

    client.on("guildMemberAdd", async (member) => {
      if (member.guild.id === autoRole.guild) {
        await member.roles.add(autoRole.role);
      }
    });
  };
}
