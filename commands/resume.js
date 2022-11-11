const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume playing!"),

  async execute(interaction) {
    const distube = interaction.distube;

    try {
      distube.resume(interaction);
    } catch (error) {}
  },
};
