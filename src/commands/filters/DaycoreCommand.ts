import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
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
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.setDaycore(!ctx.guild!.music.player!.filters.daycore);
        const msg = await ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.daycore ? "Enabled" : "Disabled"} daycore filter`, true)
            ]
        });
        if (ctx.channel!.id === ctx.guild?.music.playerMessage?.channelId) {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }
    }
}
