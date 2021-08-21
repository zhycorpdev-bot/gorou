import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Toggle karaoke filter",
    name: "karaoke",
    slash: {
        options: []
    },
    usage: "{prefix}karaoke"
})
export class KaraokeCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.setDistortion(!ctx.guild!.music.player!.filters.karaoke);
        return ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.karaoke ? "Enabled" : "Disabled"} karaoke filter`, true)
            ]
        }, "editReply");
    }
}
