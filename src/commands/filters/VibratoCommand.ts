import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Toggle vibrato filter",
    name: "vibrato",
    slash: {
        options: []
    },
    usage: "{prefix}vibrato"
})
export class VibratoCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.setVibrato(!ctx.guild!.music.player!.filters.vibrato);
        return ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.vibrato ? "Enabled" : "Disabled"} vibrato filter`, true)
            ]
        }, "editReply");
    }
}
