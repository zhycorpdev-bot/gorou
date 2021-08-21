/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { TextChannel } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";
import { parseURL } from "../../utils/parseURL";

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
        const vc = ctx.member!.voice.channel;
        const query = ctx.args.join(" ") || ctx.options?.getString("query") || (ctx.additionalArgs.get("values") ? ctx.additionalArgs.get("values")[0] : undefined);
        const { valid, matched } = parseURL(query);
        if (valid && !domains.includes(matched[1])) {
            return ctx.send({
                embeds: [
                    createEmbed("error", "Only support source from youtube, soundcloud and spotify", true)
                ]
            }, "editReply");
        }
        const src = ctx.additionalArgs.get("source") ?? ctx.options?.getString("source") as "youtube"|"soundcloud"|null ?? "youtube";
        const response = await ctx.guild!.music.node.manager.search({
            query,
            source: valid ? src : /soundcloud/gi.exec(query) ? "soundcloud" : /spotify/gi.exec(query) ? undefined : "youtube"
        }, ctx.author.id);
        if (response.loadType === "NO_MATCHES") {
            return ctx.send({
                embeds: [
                    createEmbed("error", "Couldn't find any track", true)
                ]
            }, "editReply");
        }
        if (!ctx.guild!.music.player) await ctx.guild!.music.join(vc as any, ctx.channel as TextChannel);
        if (response.loadType === "PLAYLIST_LOADED") {
            for (const trck of response.tracks) await ctx.guild!.music.player!.queue.add(trck);
            await ctx.send({
                embeds: [
                    createEmbed("info", `Loaded **${response.playlist!.name}** with \`${response.tracks.length}\` tracks`)
                ]
            }, "editReply");
        } else {
            await ctx.guild!.music.player!.queue.add(response.tracks[0]);
            // Identify if the command is being runned by another command (select menu)
            if (!ctx.additionalArgs.get("values")) {
                await ctx.send({
                    embeds: [
                        createEmbed("info", `Added **[${response.tracks[0].title}](${response.tracks[0].uri})** by **${response.tracks[0].author}**`, true)
                    ]
                }, "editReply");
            }
        }
        if (!ctx.guild!.music.player!.playing) await ctx.guild!.music.play();
    }
}
