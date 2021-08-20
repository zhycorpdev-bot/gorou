import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Set vaporwave filter",
    name: "vaporwave",
    slash: {
        options: []
    },
    usage: "{prefix}vaporwave"
})
export class VaporwaveCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        await message.guild!.music.player!.setVaporwave(!message.guild!.music.player!.filters.vaporwave);
        return message.channel.send({
            embeds: [
                createEmbed("info", `${message.guild!.music.player!.filters.vaporwave ? "Enabled" : "Disabled"} vaporwave filter`, true)
            ]
        });
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        await interaction.guild!.music.player!.setVaporwave(!interaction.guild!.music.player!.filters.vaporwave);
        return interaction.editReply({
            embeds: [
                createEmbed("info", `${interaction.guild!.music.player!.filters.vaporwave ? "Enabled" : "Disabled"} vaporwave filter`, true)
            ]
        });
    }
}
