import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Set trebblebass filter",
    name: "trebblebass",
    slash: {
        options: []
    },
    usage: "{prefix}trebblebass"
})
export class TrebblebassCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        await message.guild!.music.player!.setTrebbleBass(!message.guild!.music.player!.filters.trebblebass);
        return message.channel.send({
            embeds: [
                createEmbed("info", `${message.guild!.music.player!.filters.trebblebass ? "Enabled" : "Disabled"} trebblebass filter`, true)
            ]
        });
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        await interaction.guild!.music.player!.setTrebbleBass(!interaction.guild!.music.player!.filters.trebblebass);
        return interaction.editReply({
            embeds: [
                createEmbed("info", `${interaction.guild!.music.player!.filters.trebblebass ? "Enabled" : "Disabled"} trebblebass filter`, true)
            ]
        });
    }
}
