import config from "../config.json" with { type: "json" };
import { GetAllServers, RequestServerStatus } from "../axios.ts";
import CommandBase from "./command-base.ts";
import { Message, OmitPartialGroupDMChannel } from "discord.js";

export default class ListCommand extends CommandBase {
  override callback = async (
    interaction: OmitPartialGroupDMChannel<Message<boolean>>,
    _args?: string[],
  ) => {
    const servers = await GetAllServers();
    let message = "";

    if (servers == null) {
      interaction.reply(
        "Data returned null. Either something went wrong or there are no minecraft servers.",
      );
      return;
    }

    for (const server of servers) {
      const status = await RequestServerStatus(server.attributes.identifier);
      const name = server.attributes.name;
      const port =
        server.attributes.relationships.allocations.data[0].attributes.port;

      message += `**${name} (${port})**: ${
        status!.data.attributes.current_state
      }\n`;
    }

    interaction.reply(message);
  };
  override enabled = config.modules.ptero.enabled;
  override requiredRoles: string[] = config.modules.ptero.requiredRoles;
  override maxArgs?: number | undefined = 0;
  override minArgs: number = 0;
  override aliases?: string[] | undefined;
  override command: string = "list";
}
