import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Set tremolo filter",
    name: "tremolo",
    slash: {
        options: []
    },
    usage: "{prefix}tremolo"
})
export class TremoloCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        await message.guild!.music.player!.setTremolo(!message.guild!.music.player!.filters.tremolo);
        return message.channel.send({
            embeds: [
                createEmbed("info", `${message.guild!.music.player!.filters.tremolo ? "Enabled" : "Disabled"} tremolo filter`, true)
            ]
        });
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        await interaction.guild!.music.player!.setTremolo(!interaction.guild!.music.player!.filters.tremolo);
        return interaction.editReply({
            embeds: [
                createEmbed("info", `${interaction.guild!.music.player!.filters.tremolo ? "Enabled" : "Disabled"} tremolo filter`, true)
            ]
        });
    }
}
