import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: [],
    cooldown: 3,
    description: "Skip current track",
    name: "skip",
    slash: {
        options: []
    },
    usage: "{prefix}skip"
})
export class SkipCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        const { music } = message.guild!;
        const listeners = music.listeners.length;
        // @ts-expect-error-next-line
        if (listeners > 3 && music.player!.queue.current.requester.id !== message.author.id) {
            if (music.skipVotes.includes(message.author)) {
                return message.channel.send({
                    embeds: [
                        createEmbed("info", "You're already vote to skip the song.", true)
                    ]
                });
            }
            music.skipVotes.push(message.author);
            const needed = Math.round(listeners * 0.4);
            if (music.skipVotes.length < needed) {
                return message.channel.send({
                    embeds: [
                        createEmbed("info", "Need more votes to skip the song!", true)
                    ]
                });
            }
        }
        await music.skip();
        return message.channel.send({
            embeds: [
                createEmbed("info", `Skipped **${music.player!.queue.current!.title}**`, true)
            ]
        });
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        const { music } = interaction.guild!;
        const listeners = music.listeners.length;
        // @ts-expect-error-next-line
        if (listeners > 3 && music.player!.queue.current.requester.id !== interaction.user.id) {
            if (music.skipVotes.includes(interaction.user)) {
                return interaction.editReply({
                    embeds: [
                        createEmbed("info", "You're already vote to skip the song.", true)
                    ]
                });
            }
            music.skipVotes.push(interaction.user);
            const needed = Math.round(listeners * 0.4);
            if (music.skipVotes.length < needed) {
                return interaction.editReply({
                    embeds: [
                        createEmbed("info", "Need more votes to skip the song!", true)
                    ]
                });
            }
        }
        await music.player!.stop();
        return interaction.editReply({
            embeds: [
                createEmbed("info", `Skipped **${music.player!.queue.current!.title}**`, true)
            ]
        });
    }
}
