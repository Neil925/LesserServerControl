import { Message, OmitPartialGroupDMChannel } from "discord.js";
import CommandBase from "./command-base.ts";
import config from "../config.json" with { type: "json" };

export default class SendDMCommand extends CommandBase {
  override callback = async (
    interaction: OmitPartialGroupDMChannel<Message<boolean>>,
    args?: string[],
    _command?: string,
  ) => {
    if (!args || !args.length) {
      return;
    }

    const userId = args.at(0)!.replace("<", "").replace(">", "").replace(
      "@",
      "",
    )
      .replace("&", "").replace("!", "");
    const message = args.slice(1).join(" ");

    const user = await interaction.guild!.members.fetch(userId);
    await user.send(message);
    await interaction.delete();
  };

  override enabled = config.modules.dmLogger.enabled;
  override requiredRoles = ["697860923767128087"];
  override maxArgs? = undefined;
  override minArgs = 2;
  override aliases? = ["senddm", "dm", "message", "pm"];
  override command = "send";
}
