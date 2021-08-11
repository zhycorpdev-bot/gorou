import { CommandInteraction, ContextMenuInteraction, Message, MessageActionRow, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import { Track } from "erela.js";
import { BaseCommand } from "../../structures/BaseCommand";
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
    public async execute(message: Message, args: string[]): Promise<any> {
        const { music } = message.guild!;
        const query = args.join(" ");
        if (parseURL(query).valid) return this.client.commands.get("play")!.execute(message, args);
        const trackRes = await music.node.manager.search(query, "youtube");
        if (trackRes.loadType === "NO_MATCHES") {
            return message.channel.send({
                embeds: [createEmbed("error", `Sorry, i can't find anything`, true)]
            });
        }
        await message.channel.send({
            content: `${message.author.toString()}, Please select some tracks`,
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageSelectMenu()
                            .setMinValues(1)
                            .setMaxValues(10)
                            .setCustomId(Buffer.from(`${message.author.id}_${this.meta.name}`).toString("base64"))
                            .addOptions(this.generateSelectMenu(trackRes.tracks))
                            .setPlaceholder("Select some tracks")
                    )
            ]
        });
    }

    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction|SelectMenuInteraction|ContextMenuInteraction, tracks: string[]|null): Promise<any> {
        await interaction.deferReply();
        if (interaction.isSelectMenu() && tracks) {
            for (const track of tracks) {
                this.client.commands.get("play")!.executeInteraction(interaction, track, "youtube", true);
            }
            const channel = await interaction.channel;
            const msg = await channel!.messages.fetch(interaction.message.id).catch(() => undefined);
            if (msg !== undefined) {
                const selection = msg.components[0].components.find(x => x.type === "SELECT_MENU");
                selection!.setDisabled(true);
                await msg.edit({ components: [new MessageActionRow().addComponents(selection!)] });
            }
            return interaction.editReply({
                embeds: [
                    createEmbed("success", `Added \`${tracks.length}\` tracks to queue`, true)
                ]
            });
        }
        if (interaction.isCommand() || interaction.isContextMenu()) {
            const query = interaction.isContextMenu() ? interaction.options.getMessage("message")!.content : interaction.options.getString("query")!;
            if (parseURL(query).valid) return this.client.commands.get("play")!.executeInteraction(interaction, query);
            const trackRes = await interaction.guild!.music.node.manager.search(query, "youtube");
            if (trackRes.loadType === "NO_MATCHES") {
                return interaction.editReply({
                    embeds: [createEmbed("error", `Sorry, i can't find anything`, true)]
                });
            }
            await interaction.editReply({
                content: `${interaction.user.toString()}, Please select some tracks`,
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setMinValues(1)
                                .setMaxValues(10)
                                .setCustomId(Buffer.from(`${interaction.user.id}_${this.meta.name}`).toString("base64"))
                                .addOptions(this.generateSelectMenu(trackRes.tracks))
                                .setPlaceholder("Select some tracks")
                        )
                ]
            });
        }
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
