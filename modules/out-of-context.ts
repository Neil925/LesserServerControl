import { Client } from "discord.js";
import config from "../config.json" with { type: "json" };

const { outOfContext } = config.modules;

export default class OutOfContextModule {
  registerEvent = (client: Client) => {
    if (!outOfContext.enabled) {
      console.log("Out of context module is disabled");
      return;
    }

    console.log("Regisntering out of context module");

    client.on("messageCreate", async (ev) => {
      if (ev.channel.id != outOfContext.channelid || ev.author.bot) {
        return;
      }

      const text = ev.content;
      await ev.delete();
      await ev.channel.send(text);
    });
  };
}
