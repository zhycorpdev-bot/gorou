import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Skip current track",
    name: "skip",
    slash: {
        options: []
    },
    usage: "{prefix}skip"
})
export class SkipCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        const { music } = ctx.guild!;
        const listeners = music.listeners.length;
        if (listeners > 3 && music.player!.queue.current!.requester !== ctx.author.id) {
            if (music.skipVotes.includes(ctx.author)) {
                const msg = await ctx.send({
                    embeds: [
                        createEmbed("info", "You're already vote to skip the song.", true)
                    ]
                });
                if (music.playerMessage?.channelId === ctx.context.channelId) {
                    setTimeout(() => msg.delete().catch(() => null), 5000);
                }
                return undefined;
            }
            music.skipVotes.push(ctx.author);
            const needed = Math.round(listeners * 0.4);
            if (music.skipVotes.length < needed && music.player?.queue.current?.requester !== ctx.author.id) {
                const msg = await ctx.send({
                    embeds: [
                        createEmbed("info", `Need more votes to skip the song! **[**\`${music.skipVotes.length}\`**/**\`${needed}\`**]**`, true)
                    ]
                });
                if (music.playerMessage?.channelId === ctx.context.channelId) {
                    setTimeout(() => msg.delete().catch(() => null), 5000);
                }
                return undefined;
            }
        }
        const msg = await ctx.send({
            embeds: [
                createEmbed("info", `Skipped **[${music.player!.queue.current!.title}](${music.player!.queue.current!.uri!})**`, true)
            ]
        });
        if (music.playerMessage?.channelId === ctx.context.channelId) {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }
        return music.player?.stop();
    }
}
