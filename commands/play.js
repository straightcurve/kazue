//@ts-check
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song!")
    .addStringOption((option) =>
      option
        .setName("url_or_query")
        .setDescription("the url or query params used to find the song")
        .setRequired(true)
    ),

  async execute(interaction) {
    const distube = interaction.distube;

    const query = interaction.options.getString("url_or_query", true);
    const voiceChannel = interaction.member?.voice?.channel;
    if (voiceChannel) {
      distube.play(voiceChannel, query, {
        textChannel: interaction.channel,
        member: interaction.member,
      });
    } else {
      interaction.followUp("You must join a voice channel first.");
    }
  },
};
