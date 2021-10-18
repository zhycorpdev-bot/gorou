import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberDJ, isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Shuffle current queue",
    name: "shuffle",
    slash: {
        options: []
    },
    usage: "{prefix}shuffle"
})
export class ShuffleCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    @isMemberDJ()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.queue.shuffle();
        const msg = await ctx.send({
            embeds: [
                createEmbed("info", "Shuffled current queue", true)
            ]
        });
        if (ctx.channel!.id === ctx.guild!.music.playerChannel) {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }
        await ctx.guild?.music.updatePlayerEmbed();
    }
}
