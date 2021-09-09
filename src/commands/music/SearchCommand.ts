/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { MessageActionRow, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import { Track } from "erela.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";
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
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        const { music } = ctx.guild!;
        const tracks = ctx.additionalArgs.get("values");
        if (tracks && ctx.isSelectMenu()) {
            for (const track of tracks) {
                const newCtx = new CommandContext(ctx.context, []);
                newCtx.additionalArgs.set("values", [track]);
                this.client.commands.get("play")!.execute(newCtx);
            }
            const msg = await ctx.channel!.messages.fetch((ctx.context as SelectMenuInteraction).message.id).catch(() => undefined);
            if (msg !== undefined) {
                const selection = msg.components[0].components.find(x => x.type === "SELECT_MENU");
                selection!.setDisabled(true);
                await msg.edit({ components: [new MessageActionRow().addComponents(selection!)] });
            }
            return ctx.send({
                embeds: [
                    createEmbed("success", `Added \`${tracks.length}\` tracks to queue`, true)
                ]
            });
        }
        let query = ctx.args.join(" ") || ctx.options?.getString("query") || ctx.options?.getMessage("message")?.content;
        if (!query) {
            return ctx.send({
                embeds: [
                    createEmbed("error", "Please provide a valid query!", true)
                ]
            });
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
            return ctx.send({
                embeds: [createEmbed("error", `Sorry, i can't find anything`, true)]
            });
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
