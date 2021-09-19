/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { TextChannel } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";
import { parseURL } from "../../utils/parseURL";
import { readableTime } from "../../utils/readableTime";

const domains = ["open.spotify.com", "soundcloud.com", "www.soundcloud.com", "m.soundcloud.com", "soundcloud.app.goo.gl", "www.youtube.com", "youtube.com", "m.youtube.com", "youtu.be", "music.youtube.com"];

@DefineCommand({
    aliases: ["p"],
    cooldown: 3,
    description: "Add a track to queue",
    name: "play",
    slash: {
        options: [
            {
                name: "query",
                type: "STRING",
                required: true,
                description: "Song to search"
            },
            {
                choices: [
                    {
                        name: "Youtube",
                        value: "youtube"
                    },
                    {
                        name: "Soundcloud",
                        value: "soundcloud"
                    }
                ],
                description: "Where the search should be taken",
                name: "source",
                required: false,
                type: "STRING"
            }
        ]
    },
    usage: "{prefix}play <title>"
})
export class PlayCommand extends BaseCommand {
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        if (ctx.guild!.music.playerMessage?.channelId !== ctx.context.channelId) {
            return ctx.send({
                embeds: [createEmbed("error", `This command is restricted to <#${ctx.guild!.music.playerMessage!.channelId}>.`)]
            });
        }
        const vc = ctx.member!.voice.channel;
        const query = ctx.args.join(" ") || ctx.options?.getString("query") || (ctx.additionalArgs.get("values") ? ctx.additionalArgs.get("values")[0] : undefined);
        const fromRequester = ctx.context.channelId === ctx.guild!.music.playerMessage.channelId;
        if (!query) {
            return ctx.send({
                embeds: [
                    createEmbed("error", "Please provide a valid query!", true)
                ]
            });
        }
        const { valid, matched } = parseURL(query);
        if (valid && !domains.includes(matched[1])) {
            const msg = await ctx.send({
                embeds: [
                    createEmbed("error", "Only support source from youtube, soundcloud and spotify", true)
                ]
            }, fromRequester ? "followUp" : "editReply");
            if (fromRequester) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        const src = ctx.additionalArgs.get("source") ?? ctx.options?.getString("source") as "youtube"|"soundcloud"|null ?? "youtube";
        const response = await ctx.guild!.music.node.manager.search({
            query,
            source: valid ? src : /soundcloud/gi.exec(query) ? "soundcloud" : /spotify/gi.exec(query) ? undefined : "youtube"
        }, ctx.author.id);
        if (response.loadType === "NO_MATCHES" || !response.tracks.length) {
            const msg = await ctx.send({
                embeds: [
                    createEmbed("error", "Couldn't find any track", true)
                ]
            }, fromRequester ? "followUp" : "editReply");
            if (fromRequester) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        if (!ctx.guild!.music.player) await ctx.guild!.music.join(vc as any, ctx.channel as TextChannel);
        if (response.loadType === "PLAYLIST_LOADED") {
            for (const trck of response.tracks) await ctx.guild!.music.player!.queue.add(trck);
            const msg = await ctx.send({
                embeds: [
                    createEmbed("info", `All tracks in playlist: **[${response.playlist!.name}](${query})** **[**\`${readableTime(response.playlist!.duration)}\`**]**, has been added to the queue!`)
                ]
            }, fromRequester ? "followUp" : "editReply");
            if (fromRequester) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
        } else {
            await ctx.guild!.music.player!.queue.add(response.tracks[0]);
            // Identify if the command is being runned by another command (select menu)
            if (!ctx.additionalArgs.get("values")) {
                if (!fromRequester) {
                    await ctx.send({
                        embeds: [createEmbed("info", `✅ Track **[${response.tracks[0].title}](${response.tracks[0].uri})** has been added to the queue`).setThumbnail(response.tracks[0].thumbnail!)]
                    });
                }
            }
        }
        await ctx.guild!.music.updatePlayerEmbed();
        if (!ctx.guild!.music.player!.playing) await ctx.guild!.music.play();
    }
}
