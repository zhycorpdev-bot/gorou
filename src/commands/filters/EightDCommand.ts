import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: ["eightd"],
    cooldown: 3,
    description: "Set 8D filter",
    name: "8d",
    slash: {
        options: []
    },
    usage: "{prefix}8d"
})
export class EightDCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        await message.guild!.music.player!.setEightD(!message.guild!.music.player!.filters.eightD);
        return message.channel.send({
            embeds: [
                createEmbed("info", `${message.guild!.music.player!.filters.eightD ? "Enabled" : "Disabled"} 8D filter`, true)
            ]
        });
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        await interaction.guild!.music.player!.setEightD(!interaction.guild!.music.player!.filters.eightD);
        return interaction.editReply({
            embeds: [
                createEmbed("info", `${interaction.guild!.music.player!.filters.eightD ? "Enabled" : "Disabled"} 8D filter`, true)
            ]
        });
    }
}
