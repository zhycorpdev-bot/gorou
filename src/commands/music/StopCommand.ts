import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberDJ, isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: ["dc", "disconnect"],
    cooldown: 3,
    description: "Stop current queue",
    name: "stop",
    slash: {
        options: []
    },
    usage: "{prefix}stop"
})
export class StopCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    @isMemberDJ()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.destroy();
        await ctx.guild!.music.reset();
        const msg = await ctx.send({
            embeds: [
                createEmbed("info", "Stopped current queue", true)
            ]
        });
        if (ctx.channel!.id === ctx.guild!.music.playerChannel) {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }
    }
}
