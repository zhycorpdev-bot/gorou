import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Toggle distortion filter",
    name: "distortion",
    slash: {
        options: []
    },
    usage: "{prefix}distortion"
})
export class DistortionCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.setDistortion(!ctx.guild!.music.player!.filters.distortion);
        const msg = await ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.distortion ? "Enabled" : "Disabled"} distortion filter`, true)
            ]
        });
        if (ctx.channel!.id === ctx.guild?.music.playerMessage?.channelId) {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }
    }
}
