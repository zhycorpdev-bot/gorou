import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: ["eightd"],
    cooldown: 3,
    description: "Set 8D filter",
    name: "8d",
    slash: {
        options: []
    },
    usage: "{prefix}8d"
})
export class EightDCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        await ctx.guild!.music.player!.setEightD(!ctx.guild!.music.player!.filters.eightD);
        const msg = await ctx.send({
            embeds: [
                createEmbed("info", `${ctx.guild!.music.player!.filters.eightD ? "Enabled" : "Disabled"} 8D filter`, true)
            ]
        });
        if (ctx.channel!.id === ctx.guild?.music.playerMessage?.channelId) {
            setTimeout(() => msg.delete().catch(() => null), 5000);
        }
    }
}
