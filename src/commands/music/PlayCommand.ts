/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { TextChannel } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberDJ, isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";
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
    @isMemberDJ()
    public async execute(ctx: CommandContext): Promise<any> {
        const fromRequester = ctx.context.channelId === ctx.guild!.music.playerChannel;
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply(fromRequester);
        if (ctx.guild!.music.playerMessage && ctx.guild!.music.playerChannel !== ctx.context.channelId) {
            return ctx.send({
                embeds: [createEmbed("error", `This command is restricted to <#${ctx.guild!.music.playerChannel}>.`)]
            });
        }
        const { max_queue: maxQueue, duplicate_song: duplicateSong } = await this.client.databases.guilds.get(ctx.guild!.id, { select: ["max_queue", "duplicate_song"] });
        if (maxQueue <= (ctx.guild!.music.player?.queue.totalSize || 0)) {
            const msg = await ctx.send({
                embeds: [
                    createEmbed("error", `Max queue limit reached **\`[${maxQueue}\`**. Remove some track to add another!`, true)
                ]
            });
            if (fromRequester) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        const vc = ctx.member!.voice.channel;
        const query = ctx.args.join(" ") || ctx.options?.getString("query") || (ctx.additionalArgs.get("values") ? ctx.additionalArgs.get("values")[0] : undefined);
        if (!query) {
            const msg = await ctx.send({
                embeds: [
                    createEmbed("error", "Please provide a valid query!", true)
                ]
            }, "editReply");
            if (fromRequester) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        const { valid, matched } = parseURL(String(query));
        if (valid && !domains.includes(matched[1])) {
            const msg = await ctx.send({
                embeds: [
                    createEmbed("error", "Only support source from youtube, soundcloud and spotify", true)
                ]
            }, "editReply");
            if (fromRequester) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        const src = ctx.additionalArgs.get("source") ?? ctx.options?.getString("source") as "youtube"|"soundcloud"|null ?? "youtube";
        const response = await ctx.guild!.music.node.manager.search({
            query,
            source: valid ? src : /soundcloud/gi.exec(String(query)) ? "soundcloud" : /spotify/gi.exec(String(query)) ? undefined : "youtube"
        }, ctx.author.id);
        if (response.loadType === "NO_MATCHES" || !response.tracks.length) {
            const msg = await ctx.send({
                embeds: [
                    createEmbed("error", "Couldn't find any track", true)
                ]
            }, "editReply");
            if (fromRequester) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        if (!ctx.guild!.music.player) await ctx.guild!.music.join(vc!.id, ctx.channel as TextChannel);
        if (response.loadType === "PLAYLIST_LOADED") {
            const duplicated = response.tracks.filter(x => ctx.guild!.music.player!.queue.find(y => y.identifier === x.identifier));
            const toAdd = response.tracks.filter(x => duplicateSong && !ctx.guild!.music.player?.queue.find(y => y.identifier === x.identifier));
            for (const trck of toAdd) await ctx.guild!.music.player!.queue.add(trck);
            if (duplicateSong && duplicated.length) {
                const duplicateMessage = await ctx.send({
                    embeds: [
                        createEmbed("warn", `Over ${duplicated.length} track${duplicated.length > 1 ? "s" : ""} are skipped because it was a duplicate`)
                    ]
                });
                if (fromRequester) {
                    setTimeout(() => duplicateMessage.delete().catch(() => null), 5000);
                }
            }
            if (!toAdd.length) return;
            const msg = await ctx.send({
                embeds: [
                    createEmbed("info", `All tracks in playlist: **[${response.playlist!.name}](${query})** **[**\`${readableTime(response.playlist!.duration)}\`**]**, has been added to the queue!`)
                ]
            }, "editReply");
            if (fromRequester) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
        } else {
            const duplicated = ctx.guild!.music.player!.queue.current?.identifier === response.tracks[0].identifier ? ctx.guild!.music.player!.queue.current : ctx.guild!.music.player!.queue.find(x => x.identifier === response.tracks[0].identifier);
            if (duplicateSong && duplicated) {
                const duplicateMessage = await ctx.send({
                    embeds: [
                        createEmbed("warn", `Track **[${duplicated.title}](${duplicated.uri!})** is already queued, and this server configuration disallow duplicated tracks in queue`)
                    ]
                });
                if (fromRequester) {
                    setTimeout(() => duplicateMessage.delete().catch(() => null), 5000);
                }
                return undefined;
            }
            await ctx.guild!.music.player!.queue.add(response.tracks[0]);
            // Identify if the command is being runned by another command (select menu)
            if (!ctx.additionalArgs.get("values") && (!ctx.additionalArgs.get("fromRequesterChannel"))) {
                if (fromRequester && ctx.isInteraction()) {
                    await ctx.send({
                        embeds: [createEmbed("info", `✅ Track **[${response.tracks[0].title}](${response.tracks[0].uri})** has been added to the queue`).setThumbnail(response.tracks[0].thumbnail!)]
                    });
                } else if (!fromRequester) {
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
