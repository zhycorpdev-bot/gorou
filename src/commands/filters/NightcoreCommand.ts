import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
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
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.setNightcore(!ctx.guild!.music.player!.filters.nightcore);
        const msg = await ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.nightcore ? "Enabled" : "Disabled"} nightcore filter`, true)
            ]
        });
        if (ctx.channel!.id === ctx.guild?.music.playerMessage?.channelId) {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }
    }
}
