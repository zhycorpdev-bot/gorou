import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: ["clearfilter", "clear"],
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
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.clearFilters(true);
        const msg = await ctx.send({
            embeds: [
                createEmbed("info", "Cleared applied filters", true)
            ]
        });
        if (ctx.channel!.id === ctx.guild?.music.playerMessage?.channelId) {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }
    }
}
