import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Toggle daycore filter",
    name: "daycore",
    slash: {
        options: []
    },
    usage: "{prefix}daycore"
})
export class DaycoreCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        await message.guild!.music.player!.setDaycore(!message.guild!.music.player!.filters.daycore);
        return message.channel.send({
            embeds: [
                createEmbed("info", `${message.guild!.music.player!.filters.daycore ? "Enabled" : "Disabled"} daycore filter`, true)
            ]
        });
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        await interaction.guild!.music.player!.setDaycore(!interaction.guild!.music.player!.filters.daycore);
        return interaction.editReply({
            embeds: [
                createEmbed("info", `${interaction.guild!.music.player!.filters.daycore ? "Enabled" : "Disabled"} daycore filter`, true)
            ]
        });
    }
}
