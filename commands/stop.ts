import config from "../config.json" with { type: "json" };
import { GetServerFromPort, SendSignal } from "../axios.ts";
import CommandBase from "./command-base.ts";
import { Message, OmitPartialGroupDMChannel } from "discord.js";

export default class StopCommand extends CommandBase {
  override callback = async (
    interaction: OmitPartialGroupDMChannel<Message<boolean>>,
    args?: string[],
    _command?: string,
  ) => {
    const port = args!.at(0)!;
    const signal = "stop";

    const server = await GetServerFromPort(port);

    const identifier = server.attributes.identifier;
    if (identifier == null || identifier == undefined) {
      await interaction.reply(
        "Error. Could not find server corrosponding to that port.",
      );
      return;
    }

    try {
      await SendSignal(identifier, signal);
    } catch (err) {
      console.log(err);
      return;
    }

    interaction.reply(
      `Signal \`stop\` has been sucessfully sent to server ${server.attributes.name}.`,
    );
  };
  override enabled = config.modules.ptero.enabled;
  override requiredRoles = config.modules.ptero.requiredRoles;
  override maxArgs? = 1;
  override minArgs = 1;
  override aliases? = undefined;
  override command = "stop";
  override expectedArgs = "<port>";
}
