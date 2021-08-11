import { CommandInteraction, Message, SelectMenuInteraction, TextChannel } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";
import { parseURL } from "../../utils/parseURL";

const domains = ["soundcloud.com", "www.soundcloud.com", "m.soundcloud.com", "soundcloud.app.goo.gl", "www.youtube.com", "youtube.com", "m.youtube.com", "youtu.be", "music.youtube.com"];

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
    // @isMemberDJ()
    public async execute(message: Message, args: string[]): Promise<any> {
        // if (message.guild!.setting?.max_queue && message.guild!.setting.max_queue <= message.guild!.music.queue.length) {
        //     return message.channel.send(createEmbed("error", `Sorry, but max queue length is \`${message.guild!.setting.max_queue}\` tracks. Remove some track to add another!`, true));
        // }
        const vc = message.member!.voice.channel;
        const query = args.join(" ");
        const { valid, matched } = parseURL(query);
        if (valid && !domains.includes(matched[1])) {
            return message.channel.send({
                embeds: [
                    createEmbed("error", "Only support source from youtube & soundcloud", true)
                ]
            });
        }
        const response = await message.guild!.music.node.manager.search({ query, source: valid ? undefined : /soundcloud/gi.exec(query) ? "soundcloud" : "youtube" }, message.author.id);
        if (response.loadType === "NO_MATCHES") {
            return message.channel.send({
                embeds: [
                    createEmbed("error", "Couldn't find any track", true)
                ]
            });
        }
        if (!message.guild!.music.player) await message.guild!.music.join(vc as any, message.channel as TextChannel);
        if (response.loadType === "PLAYLIST_LOADED") {
            for (const trck of response.tracks) await message.guild!.music.player!.queue.add(trck);
            await message.channel.send({
                embeds: [
                    createEmbed("info", `Loaded **${response.playlist!.name}** with \`${response.tracks.length}\` tracks`)
                ]
            });
        } else {
            await message.guild!.music.player!.queue.add(response.tracks[0]);
            if (message.guild!.music.player!.queue.length) {
                await message.channel.send({
                    embeds: [
                        createEmbed("info", `Added **[${response.tracks[0].title}](${response.tracks[0].uri})** by **${response.tracks[0].author}**`, true)
                    ]
                });
            }
        }
        if (!message.guild!.music.player!.playing) await message.guild!.music.play();
    }

    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction|SelectMenuInteraction, url: string|null, source: string|null, anotherInteraction = false): Promise<any> {
        if (!interaction.deferred) await interaction.deferReply();
        const member = interaction.guild!.members.resolve(interaction.user.id);
        const vc = member!.voice.channel;
        const query = url ?? (interaction as CommandInteraction).options.getString("query")!;
        const src = source as any ?? (interaction as CommandInteraction).options.getString("source") as "youtube"|"soundcloud"|null ?? "youtube";
        const { valid, matched } = parseURL(query);
        if (valid && !domains.includes(matched[1])) {
            return interaction.editReply({
                embeds: [
                    createEmbed("error", "Only support source from youtube & soundcloud", true)
                ]
            });
        }
        const response = await interaction.guild!.music.node.manager.search({
            query,
            source: valid ? src : /soundcloud/gi.exec(query) ? "soundcloud" : "youtube"
        }, interaction.user.id);
        if (response.loadType === "NO_MATCHES") {
            return interaction.editReply({
                embeds: [
                    createEmbed("error", "Couldn't find any track", true)
                ]
            });
        }
        if (!interaction.guild!.music.player) await interaction.guild!.music.join(vc as any, interaction.channel as TextChannel);
        if (response.loadType === "PLAYLIST_LOADED") {
            for (const trck of response.tracks) await interaction.guild!.music.player!.queue.add(trck);
            await interaction.editReply({
                embeds: [
                    createEmbed("info", `Loaded **${response.playlist!.name}** with \`${response.tracks.length}\` tracks`)
                ]
            });
        } else {
            await interaction.guild!.music.player!.queue.add(response.tracks[0]);
            if (!anotherInteraction) {
                await interaction.editReply({
                    embeds: [
                        createEmbed("info", `Added **[${response.tracks[0].title}](${response.tracks[0].uri})** by **${response.tracks[0].author}**`, true)
                    ]
                });
            }
        }
        if (!interaction.guild!.music.player!.playing) await interaction.guild!.music.play();
    }
}
