import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Toggle vaporwave filter",
    name: "vaporwave",
    slash: {
        options: []
    },
    usage: "{prefix}vaporwave"
})
export class VaporwaveCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.setVaporwave(!ctx.guild!.music.player!.filters.vaporwave);
        return ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.vaporwave ? "Enabled" : "Disabled"} vaporwave filter`, true)
            ]
        });
    }
}
