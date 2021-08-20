import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: ["clearfilter"],
    cooldown: 3,
    description: "Clear applied filter",
    name: "clearfilters",
    slash: {
        options: []
    },
    usage: "{prefix}clearfilters"
})
export class ClearFiltersCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        await message.guild!.music.player!.clearFilters(true);
        return message.channel.send({
            embeds: [
                createEmbed("info", "Cleared applied filters", true)
            ]
        });
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        await interaction.guild!.music.player!.clearFilters(true);
        return interaction.editReply({
            embeds: [
                createEmbed("info", "Cleared applied filters", true)
            ]
        });
    }
}
