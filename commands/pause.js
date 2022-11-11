const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song!"),

  async execute(interaction) {
    const distube = interaction.distube;

    try {
      distube.pause(interaction);
    } catch (error) {}
  },
};
