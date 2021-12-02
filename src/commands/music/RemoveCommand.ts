import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberDJ, isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: ["rm"],
    cooldown: 3,
    description: "Remove specified track from current queue",
    name: "remove",
    slash: {
        options: [
            {
                name: "position",
                description: "Track position in queue to remove",
                type: "INTEGER",
                required: true
            }
        ]
    },
    usage: "{prefix}remove [track position]"
})
export class RemoveCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    @isMemberDJ()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        const { music } = ctx.guild!;
        const position = Number(ctx.args[0] || ctx.options?.getInteger("position"));
        if (isNaN(position) || position < 1 || position > music.player!.queue.totalSize) {
            return ctx.send({
                embeds: [createEmbed("error", `Please specify a valid number between 1 - ${music.player!.queue.totalSize}!`, true)]
            });
        }
        const removed = music.player!.queue.splice(position - 1, 1)[0];
        const m = await ctx.send({ embeds: [createEmbed("info", `Removed **[${removed.title.escapeMarkdown()}](${removed.uri!})** from the queue!`)] });
        if (ctx.channel!.id === ctx.guild!.music.playerChannel) {
            setTimeout(() => m.delete().catch(() => null), 5000);
        }
        return music.updatePlayerEmbed();
    }
}
