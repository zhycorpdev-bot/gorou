import { Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";

@DefineCommand({
    aliases: ["dc", "disconnect"],
    cooldown: 3,
    description: "Stop current queue",
    name: "stop",
    usage: "{prefix}stop"
})
export class StopCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(message: Message): Promise<any> {
        if (!message.guild!.music.player) {
            return message.channel.send({
                embeds: [
                    createEmbed("error", "I don't play anything right now.", true)
                ]
            });
        }
        await message.guild!.music.player.destroy();
        return message.channel.send({
            embeds: [
                createEmbed("info", "Stopped current queue", true)
            ]
        });
    }
}
