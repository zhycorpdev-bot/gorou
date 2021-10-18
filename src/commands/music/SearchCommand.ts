/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import { Track } from "erela.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberDJ, isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";
import { parseURL } from "../../utils/parseURL";
import { readableTime } from "../../utils/readableTime";

@DefineCommand({
    aliases: ["sr"],
    contextChat: "Add to queue",
    cooldown: 3,
    description: "Search track to add to the queue",
    name: "search",
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
    usage: "{prefix}search <title>"
})
export class SearchCommand extends BaseCommand {
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    @isMemberDJ()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
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
            if (ctx.context.channelId === ctx.guild!.music.playerChannel) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        const { music } = ctx.guild!;
        const tracks = ctx.additionalArgs.get("values");
        if (tracks && ctx.isSelectMenu()) {
            const duplicated = tracks.filter((x: string) => music.player?.queue.find(y => y.uri === x)) as Track[];
            const toAdd = tracks.filter((x: string) => duplicateSong && !music.player?.queue.find(y => y.uri === x));
            for (const track of toAdd) {
                const newCtx = new CommandContext(ctx.context, []);
                newCtx.additionalArgs.set("values", [track]);
                this.client.commands.get("play")!.execute(newCtx);
            }
            const msg = await ctx.channel!.messages.fetch((ctx.context as SelectMenuInteraction).message.id).catch(() => undefined);
            if (msg !== undefined) {
                const selection = msg.components[0].components.find(x => x.type === "SELECT_MENU");
                selection!.setDisabled(true);
                if (msg.channelId === music.playerChannel) await msg.delete().catch(() => null);
                else await msg.edit({ components: [new MessageActionRow().addComponents(selection!)] });
            }
            if (duplicateSong && duplicated.length) {
                const duplicateMessage = await ctx.send({
                    embeds: [
                        createEmbed("warn", `Over ${duplicated.length} track${duplicated.length > 1 ? "s" : ""} are skipped because it was a duplicate`)
                    ]
                });
                if (ctx.context.channelId === music.playerChannel) {
                    setTimeout(() => duplicateMessage.delete().catch(() => null), 5000);
                }
            }
            if (!toAdd.length) return;
            const message = await ctx.send({
                embeds: [
                    createEmbed("success", `Added \`${tracks.length}\` tracks to queue`, true)
                ]
            });
            if (ctx.context.channelId === music.playerChannel) {
                setTimeout(() => message.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        let query = ctx.args.join(" ") || ctx.options?.getString("query") || ctx.options?.getMessage("message")?.content;
        if (!query) {
            const msg = await ctx.send({
                embeds: [
                    createEmbed("error", "Please provide a valid query!", true)
                ]
            });
            if (music.playerChannel === ctx.context.channelId) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        // Remove command prefix if exists
        for (const alias of this.meta.aliases!.concat(this.client.commands.get("play")!.meta.aliases!)) {
            query = query.replace(`${this.client.config.prefix}${alias}`, "");
        }
        query = query.replace(`${this.client.config.prefix}play`, "").replace(`${this.client.config.prefix}search`, "");
        if (parseURL(String(query)).valid) {
            const newCtx = new CommandContext(ctx.context, [String(query)]);
            return this.client.commands.get("play")!.execute(newCtx);
        }
        const trackRes = await music.node.manager.search(String(query), "youtube");
        if (trackRes.loadType === "NO_MATCHES") {
            const msg = await ctx.send({
                embeds: [createEmbed("error", `Sorry, i can't find anything`, true)]
            });
            if (music.playerChannel === ctx.context.channelId) {
                setTimeout(() => msg.delete().catch(() => null), 5000);
            }
            return undefined;
        }
        await ctx.send({
            content: `${ctx.author.toString()}, Please select some tracks`,
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setMinValues(1)
                            .setMaxValues(10)
                            .setCustomId(Buffer.from(`${ctx.author.id}_${this.meta.name}`).toString("base64"))
                            .addOptions(this.generateSelectMenu(trackRes.tracks))
                            .setPlaceholder("Select some tracks")
                    )
            ]
        });
    }

    private generateSelectMenu(tracks: Track[]): MessageSelectOptionData[] {
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        return tracks.slice(0, 10).map((x, i) => (
            {
                label: x.title.length > 98 ? `${x.title.substr(0, 97)}...` : x.title,
                emoji: emojis[i],
                description: `${x.author} · ${readableTime(x.duration)}`,
                value: x.uri
            }
        ));
    }
}
