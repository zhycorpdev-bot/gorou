import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Toggle soft filter",
    name: "soft",
    slash: {
        options: []
    },
    usage: "{prefix}soft"
})
export class SoftCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.setSoft(!ctx.guild!.music.player!.filters.soft);
        return ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.soft ? "Enabled" : "Disabled"} soft filter`, true)
            ]
        }, "editReply");
    }
}
