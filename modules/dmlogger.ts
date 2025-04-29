import { ChannelType, Client } from "discord.js";
import config from "../config.json" with { type: "json" };

const { dmLogger } = config.modules;

export default class DMLoggerModule {
  registerEvent = (client: Client) => {
    if (!dmLogger.enabled) {
      console.log("DM Logger module is disabled");
      return;
    }

    console.log("Registering DM Logger module");

    client.on("messageCreate", async (ev) => {
      if (ev.author.bot) {
        return;
      }

      if (dmLogger.enabled && ev.channel.isDMBased()) {
        const channel = await (await client.guilds.fetch(dmLogger.guild))
          .channels.fetch(dmLogger.channelid);

        if (channel && channel.type == ChannelType.GuildText) {
          await channel.send(`<@!${ev.author.id}>: ${ev.content}`);
        }
      }
    });
  };
}
