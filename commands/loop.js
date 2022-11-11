const { SlashCommandBuilder } = require("discord.js");
const { RepeatMode } = require("distube");

let mode = RepeatMode.DISABLED;

const nextMode = (mode) => {
  return mode++ % (RepeatMode.QUEUE + 1);
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("loop")
    .setDescription("Change the loop option!"),

  async execute(interaction) {
    const distube = interaction.distube;

    try {
      mode = nextMode(mode);
      distube.setRepeatMode(interaction, mode);

      await interaction.followUp(
        `Set repeat mode to \`${
          mode ? (mode === 2 ? "All Queue" : "This Song") : "Off"
        }\``
      );
    } catch (error) {
      if (mode === RepeatMode.DISABLED) mode = RepeatMode.QUEUE;
      else mode--;
    }
  },
};
