import {
  Client,
  Message,
  OmitPartialGroupDMChannel,
  PermissionsBitField,
} from "discord.js";
import config from "../config.json" with { type: "json" };

const { prefix, validChannels } = config;

export default abstract class CommandBase {
  registerCommand(client: Client<boolean>) {
    if (!this.enabled) {
      console.log(`Command ${this.command} is disabled.`);
      return;
    }

    console.log(`Registering command "${this.command}"`);

    client.on("messageCreate", async (interaction) => {
      if (await this.validate(interaction)) {
        await this.callback(interaction, this.args, this.args?.join(" "));
      }
    });
  }

  async validate(
    interaction: OmitPartialGroupDMChannel<Message<boolean>>,
  ): Promise<boolean> {
    const { member, content, guild, channel } = interaction;

    if (!member || !guild) {
      return false;
    }

    if (validChannels.length && !validChannels.includes(channel.id)) {
      return false;
    }

    if (
      !content.toLowerCase().startsWith(`${prefix}${this.command}`) &&
      !this.aliases?.some((x) =>
        this.command.toLowerCase().startsWith(`${prefix}${x.toLowerCase()}`)
      )
    ) {
      return false;
    }

    if (this.permissions) {
      for (const permission of this.permissions) {
        if (!member.permissions.has(permission)) {
          interaction.reply(this.permissionError);
          return false;
        }
      }
    }

    // Ensure the user has the required roles.
    let flag = false;

    for (const requiredRole of this.requiredRoles) {
      const roles = await guild.roles.fetch();

      const role = roles.find((x) => x.id === requiredRole);

      if (role && member.roles.cache.some((x) => x.id === role.id)) {
        flag = true;
        break;
      }
    }

    if (!flag && this.requiredRoles.length) {
      interaction.reply(
        "You do not have a valid role to run this command.",
      );
      return false;
    }

    // Split on any number of spaces
    const args = content.split(/[ ]+/);

    // Remove the command which is the first index
    args.shift();

    // Ensure we have the correct number of arguemnts
    if (
      args.length < this.minArgs || (this.maxArgs && args.length > this.maxArgs)
    ) {
      interaction.reply(
        `Incorrect syntax! Use ${prefix}${this.command} ${this.expectedArgs}`,
      );
      return false;
    }

    this.args = args;

    return true;
  }

  args: string[] | undefined;

  abstract command: string;
  abstract aliases?: string[];
  expectedArgs: string = "";
  permissionError: string = "You do not have permission to run this command.";
  permissions?: PermissionsBitField[];
  abstract minArgs: number;
  abstract maxArgs?: number;
  abstract requiredRoles: string[];
  abstract enabled: boolean;
  abstract callback: (
    interaction: OmitPartialGroupDMChannel<Message<boolean>>,
    args?: string[],
    command?: string,
  ) => Promise<void>;
}
