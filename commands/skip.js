const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the current song!"),

  async execute(interaction) {
    const distube = interaction.distube;

    try {
      distube.skip(interaction);
    } catch (error) {}
  },
};
