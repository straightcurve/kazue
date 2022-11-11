const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playing!"),

  async execute(interaction) {
    const distube = interaction.distube;

    try {
      distube.stop(interaction);
    } catch (error) {}
  },
};
