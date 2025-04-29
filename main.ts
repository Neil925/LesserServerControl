import ListCommand from "./commands/list.ts";
import RestartCommand from "./commands/restart.ts";
import SendDMCommand from "./commands/send-dm.ts";
import StartCommand from "./commands/start.ts";
import StopCommand from "./commands/stop.ts";
import config from "./config.json" with { type: "json" };
import { Client, GatewayIntentBits, Partials } from "discord.js";
import AutoAssignRoleModule from "./modules/auto-assign-role.ts";
import DMLoggerModule from "./modules/dmlogger.ts";
import OutOfContextModule from "./modules/out-of-context.ts";
import TransendenceModule from "./modules/transcendens.ts";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
  ],
  partials: [Partials.Channel, Partials.Message],
});

const { discordToken } = config;

client.on("ready", () => {
  console.log(`Logged in as ${client.user!.tag}!`);

  console.log("\nStarting command registration");
  new ListCommand().registerCommand(client);
  new RestartCommand().registerCommand(client);
  new SendDMCommand().registerCommand(client);
  new StartCommand().registerCommand(client);
  new StopCommand().registerCommand(client);

  console.log("\nStarting module registration");
  new AutoAssignRoleModule().registerEvent(client);
  new DMLoggerModule().registerEvent(client);
  new OutOfContextModule().registerEvent(client);
  new TransendenceModule().registerEvent(client);

  console.log("\nNow running...");
});

client.login(discordToken);
