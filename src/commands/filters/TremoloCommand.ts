import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Toggle tremolo filter",
    name: "tremolo",
    slash: {
        options: []
    },
    usage: "{prefix}tremolo"
})
export class TremoloCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.setTremolo(!ctx.guild!.music.player!.filters.tremolo);
        return ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.tremolo ? "Enabled" : "Disabled"} tremolo filter`, true)
            ]
        }, "editReply");
    }
}
