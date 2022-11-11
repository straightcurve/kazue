//@ts-check
require("dotenv").config();

const DISCORD_APP_ID = process.env.DISCORD_APP_ID || "";
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || "";
const Discord = require("discord.js");
const path = require("path");
const fs = require("fs");

const isDev = !!DISCORD_GUILD_ID?.length;

if (!DISCORD_APP_ID)
  throw new Error(
    "specify DISCORD_APP_ID, get it from https://discord.com/developers/applications/{your_application_id}"
  );

if (!DISCORD_BOT_TOKEN)
  throw new Error(
    "specify DISCORD_BOT_TOKEN, get it from https://discord.com/developers/applications/{your_application_id}/bot"
  );

async function setupApplicationCommands() {
  const commandsPath = path.join(__dirname, "commands");
  const commands = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"))
    .map((file) => {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);

      if (!("data" in command && "execute" in command)) {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
      }

      command.filePath = filePath;
      return command;
    })
    .filter((c) => c.data !== null && c.data !== undefined);

  await updateApplicationCommands(
    commands.map((c) => c.data).filter((c) => c.name !== "404")
  );

  const collection = new Discord.Collection();

  for (const command of commands) {
    // Set a new item in the Collection with the key as the command name and the
    // value as the exported module
    collection.set(command.data.name, command);
  }

  return collection;
}

async function updateApplicationCommands(commands) {
  const { REST, Routes } = require("discord.js");

  const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

  (async () => {
    try {
      console.log("Started refreshing application (/) commands.");

      if (isDev)
        await rest.put(
          Routes.applicationGuildCommands(DISCORD_APP_ID, DISCORD_GUILD_ID),
          {
            body: commands,
          }
        );
      else
        await rest.put(Routes.applicationCommands(DISCORD_APP_ID), {
          body: commands,
        });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
}

async function bootstrap() {
  const client = new Discord.Client({
    intents: ["Guilds", "GuildVoiceStates", "GuildMessages", "MessageContent"],
  });
  const config = {
    prefix: "$",
    token: DISCORD_BOT_TOKEN,
  };

  const { DisTube } = require("distube");
  const { SoundCloudPlugin } = require("@distube/soundcloud");
  const { SpotifyPlugin } = require("@distube/spotify");
  const distube = new DisTube(client, {
    searchSongs: 5,
    searchCooldown: 30,
    leaveOnEmpty: false,
    leaveOnFinish: false,
    leaveOnStop: false,
    plugins: [new SoundCloudPlugin(), new SpotifyPlugin()],
  });
  client.commands = await setupApplicationCommands();

  client.on("ready", (client) => {
    console.log(`Logged in as ${client.user.tag}!`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command)
      return (await interaction.client.commands.get("404")).execute();

    interaction.distube = distube;

    try {
      await interaction.deferReply();
      await command.execute(interaction);
      await interaction.followUp("OK");
    } catch (error) {
      console.error(error);
      await interaction.followUp({
        content: "Sorry, I failed >////<",
        ephemeral: true,
      });
    }
  });

  // Queue status template
  const status = (queue) => {
    try {
      return `Volume: \`${queue.volume}%\` | Filter: \`${
        queue.filters.join(", ") || "Off"
      }\` | Loop: \`${
        queue.repeatMode
          ? queue.repeatMode === 2
            ? "All Queue"
            : "This Song"
          : "Off"
      }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
    } catch (error) {
      return `Volume: \`${queue.volume}%\ | Loop: \`${
        queue.repeatMode
          ? queue.repeatMode === 2
            ? "All Queue"
            : "This Song"
          : "Off"
      }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;
    }
  };

  // DisTube event listeners, more in the documentation page
  distube
    .on("playSong", (queue, song) =>
      queue.textChannel?.send(
        `Playing \`${song.name}\` - \`${
          song.formattedDuration
        }\`\nRequested by: ${song.user}\n${status(queue)}`
      )
    )
    .on("addSong", (queue, song) =>
      queue.textChannel?.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
      )
    )
    .on("addList", (queue, playlist) =>
      queue.textChannel?.send(
        `Added \`${playlist.name}\` playlist (${
          playlist.songs.length
        } songs) to queue\n${status(queue)}`
      )
    )
    .on("error", (textChannel, e) => {
      console.error(e);
      textChannel?.send(`An error encountered: ${e.message.slice(0, 2000)}`);
    })
    .on("finish", (queue) => queue.textChannel?.send("Finish queue!"))
    .on("finishSong", (queue) => queue.textChannel?.send("Finish song!"))
    .on("disconnect", (queue) => queue.textChannel?.send("Disconnected!"))
    .on("empty", (queue) =>
      queue.textChannel?.send(
        "The voice channel is empty! Leaving the voice channel..."
      )
    )
    // DisTubeOptions.searchSongs > 1
    .on("searchResult", (message, result) => {
      let i = 0;
      message.channel.send(
        `**Choose an option from below**\n${result
          .map(
            (song) => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``
          )
          .join("\n")}\n*Enter anything else or wait 30 seconds to cancel*`
      );
    })
    .on("searchCancel", (message) => message.channel.send("Searching canceled"))
    .on("searchInvalidAnswer", (message) =>
      message.channel.send("Invalid number of result.")
    )
    .on("searchNoResult", (message) => message.channel.send("No result found!"))
    .on("searchDone", () => {});

  client.login(config.token);
}

bootstrap();
