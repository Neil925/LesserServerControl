import config from "../config.json" with { type: "json" };
import {
  GetServerFromPort,
  RequestServerStatus,
  SendSignal,
} from "../axios.ts";
import CommandBase from "./command-base.ts";
import { Message, OmitPartialGroupDMChannel } from "discord.js";

export default class StartCommand extends CommandBase {
  override callback = async (
    interaction: OmitPartialGroupDMChannel<Message<boolean>>,
    args?: string[],
    _command?: string,
  ) => {
    const port = args!.at(0)!;
    const signal = "start";
    // deno-lint-ignore prefer-const
    let interval: number | undefined;
    let seconds = 0;

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

    const reply = await interaction.reply(
      `Signal \`${signal}\` has been sucessfully sent to server ${server.attributes.name}.\nAwaiting startup.`,
    );

    interval = setInterval(async function () {
      const status = await RequestServerStatus(identifier);

      if (status == null) {
        clearInterval(interval);
        return;
      }

      if (status.data.attributes.current_state == "running") {
        await reply.edit(
          `${reply.content.split("\n")[0]}\nServer is now online!`,
        );
        clearInterval(interval);
        return;
      }

      seconds++;

      if (seconds % 3 == 0) {
        if (reply.content.endsWith(". . .")) {
          await reply.edit(reply.content.replace(". . .", "."));
        } else {
          await reply.edit(`${reply.content} .`);
        }
      }
    }, 1000);
  };
  override enabled = config.modules.ptero.enabled;
  override requiredRoles = config.modules.ptero.requiredRoles;
  override maxArgs? = 1;
  override minArgs = 1;
  override aliases? = undefined;
  override command = "start";
  override expectedArgs = "<port>";
}
