import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Toggle nightcore filter",
    name: "nightcore",
    slash: {
        options: []
    },
    usage: "{prefix}nightcore"
})
export class NightcoreCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        await message.guild!.music.player!.setNightcore(!message.guild!.music.player!.filters.nightcore);
        return message.channel.send({
            embeds: [
                createEmbed("info", `${message.guild!.music.player!.filters.nightcore ? "Enabled" : "Disabled"} nightcore filter`, true)
            ]
        });
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        await interaction.guild!.music.player!.setNightcore(!interaction.guild!.music.player!.filters.nightcore);
        return interaction.editReply({
            embeds: [
                createEmbed("info", `${interaction.guild!.music.player!.filters.nightcore ? "Enabled" : "Disabled"} nightcore filter`, true)
            ]
        });
    }
}
