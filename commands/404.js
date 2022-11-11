const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("404").setDescription("Not found!"),

  async execute(interaction) {
    interaction.followUp("Sorry, I don't know what that means >////<");
  },
};
