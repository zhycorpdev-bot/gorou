import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Show or change the music player's volume",
    name: "volume",
    slash: {
        options: [
            {
                name: "volume",
                description: "Volume to set",
                type: "INTEGER",
                required: true
            }
        ]
    },
    usage: "{prefix}volume [new volume]"
})
export class VolumeCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        const { music } = ctx.guild!;
        let volume = Number(ctx.args[0] || ctx.options?.getInteger("volume"));
        if (isNaN(volume)) {
            const msg = await ctx.send({ embeds: [createEmbed("info", `📶 The current volume is \`${music.player!.volume.toString()}\``)] });
            if (ctx.channel!.id === ctx.guild?.music.playerMessage?.channelId) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        if (volume < 0) volume = 0;
        if (volume === 0) {
            const msg = await ctx.send({ embeds: [createEmbed("warn", "❗ Please pause the music player instead of setting the volume to \`0\`")] });
            if (ctx.channel!.id === ctx.guild?.music.playerMessage?.channelId) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        if (volume > 100) {
            const msg = await ctx.send({
                embeds: [createEmbed("warn", `❗ I can't set the volume above \`100\``)]
            });
            if (ctx.channel!.id === ctx.guild?.music.playerMessage?.channelId) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }

        music.player?.setVolume(volume);
        const m = await ctx.send({ embeds: [createEmbed("info", `📶 Volume set to \`${volume}\``)] });
        if (ctx.channel!.id === ctx.guild?.music.playerMessage?.channelId) {
            setTimeout(() => m.delete().catch(() => null), 5000);
        }
        return music.updatePlayerEmbed();
    }
}
