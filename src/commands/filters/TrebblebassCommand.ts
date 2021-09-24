import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Toggle trebblebass filter",
    name: "trebblebass",
    slash: {
        options: []
    },
    usage: "{prefix}trebblebass"
})
export class TrebblebassCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        await ctx.guild!.music.player!.setTrebbleBass(!ctx.guild!.music.player!.filters.trebblebass);
        const msg = await ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.trebblebass ? "Enabled" : "Disabled"} trebblebass filter`, true)
            ]
        });
        if (ctx.channel!.id === ctx.guild!.music.playerChannel) {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }
    }
}
