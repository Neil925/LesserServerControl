import { ChannelType, Client } from "discord.js";
import config from "../config.json" with { type: "json" };

const { transendence } = config.modules;

export default class TransendenceModule {
  registerEvent = (client: Client) => {
    if (!transendence.enabled) {
      console.log("Transencence module is disabled");
      return;
    }

    console.log("Regisntering transendence module");
    client.on("guildMemberUpdate", async (oldMember, newMember) => {
      if (oldMember.nickname == newMember.nickname) {
        return;
      }

      const channel = await newMember.guild.channels.fetch(
        "1024154228186427432",
      );

      if (!channel || channel.type != ChannelType.GuildText) {
        return;
      }

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
  };
}
