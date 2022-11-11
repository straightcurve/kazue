//@ts-check

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Display the queue!"),

  async execute(interaction) {
    const distube = interaction.distube;

    const queue = distube.getQueue(interaction);
    if (!queue) {
      await interaction.followUp("Nothing playing right now!");
    } else {
      await interaction.followUp(
        `Current queue:\n${queue.songs
          .map(
            (song, id) =>
              `**${id ? id : "Playing"}**. ${song.name} - \`${
                song.formattedDuration
              }\``
          )
          .slice(0, 10)
          .join("\n")}`
      );
    }
  },
};
