import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Set pop filter",
    name: "pop",
    slash: {
        options: []
    },
    usage: "{prefix}pop"
})
export class PopCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        await message.guild!.music.player!.setPop(!message.guild!.music.player!.filters.pop);
        return message.channel.send({
            embeds: [
                createEmbed("info", `${message.guild!.music.player!.filters.pop ? "Enabled" : "Disabled"} pop filter`, true)
            ]
        });
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        await interaction.guild!.music.player!.setPop(!interaction.guild!.music.player!.filters.pop);
        return interaction.editReply({
            embeds: [
                createEmbed("info", `${interaction.guild!.music.player!.filters.pop ? "Enabled" : "Disabled"} pop filter`, true)
            ]
        });
    }
}
