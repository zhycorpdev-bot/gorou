import { GuildMember, Message } from "discord.js";
import { BotClient } from "../structures/BotClient";
import { createEmbed } from "./createEmbed";
import { formatMS } from "./formatMS";
import { MusicHandler } from "./MusicHandler";
import { APIMessage } from "discord-api-types/v9";

export class Util {
    public constructor(public client: BotClient) {}

    public convertToMessage(msg: APIMessage|Message): Message {
        if (!(msg instanceof Message)) {
            const newMsg = new Message(this.client as any, msg);
            // @ts-expect-error-next-line
            newMsg._patch(msg);
            return newMsg;
        }
        return msg;
    }

    public doTimeout(vcMembers: GuildMember[], music: MusicHandler): any {
        try {
            if (vcMembers.length !== 0) return undefined;
            clearTimeout(music.timeout!);
            music.timeout = undefined;
            music.player!.pause(true);
            const timeout = this.client.config.deleteQueueTimeout;
            const duration = formatMS(timeout);
            const textChannel = this.client.channels.cache.get(music.player!.textChannel!);
            music.oldVoiceStateUpdateMessage = null;
            music.timeout = setTimeout(() => {
                if (textChannel?.isText()) {
                    void textChannel.send({
                        embeds: [
                            createEmbed("error", `**${duration}** have passed and there is no one who joins my voice channel, the queue was deleted.`)
                                .setTitle("⏹ Queue deleted.")
                        ]
                    }).catch(e => { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); return null; })
                        .then(async msg => {
                            if (msg?.channelId === music.playerMessage?.channelId) {
                                const old = await music.playerMessage?.channel.messages.fetch(music.oldVoiceStateUpdateMessage!, { cache: false }).catch(() => null);
                                if (old) old.delete().catch(() => null);
                                setTimeout(() => msg?.delete().catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e)), 5000);
                            }
                            await music.reset();
                            music.oldVoiceStateUpdateMessage = null;
                        });
                }
                music.player?.destroy();
            }, timeout);
            if (textChannel?.isText()) {
                textChannel.send({
                    embeds: [
                        createEmbed("warn", "Everyone has left from my voice channel, to save resources, the queue was paused. " +
                        `If there's no one who joins my voice channel in the next **${duration}**, the queue will be deleted.`)
                            .setTitle("⏸ Queue paused.")
                    ]
                }).then(msg => music.oldVoiceStateUpdateMessage = msg.id).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
            }
        } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
    }

    public resumeTimeout(vcMembers: GuildMember[], music: MusicHandler): any {
        if (vcMembers.length > 0) {
            if (music.player?.playing) return undefined;
            try {
                const textChannel = this.client.channels.cache.get(music.player!.textChannel!);
                clearTimeout(music.timeout!);
                music.timeout = undefined;
                const song = music.player!.queue.current;
                if (textChannel?.isText() && textChannel.id !== music.playerMessage?.channelId) {
                    const embed = createEmbed("info", `Someone joins the voice channel. Enjoy the music 🎶\nNow Playing: **[${song!.title}](${(song as any).url})**`)
                        .setTitle("▶ Queue resumed");
                    // @ts-expect-error-next-line
                    const thumbnail = song?.displayThumbnail("maxresdefault");
                    if (thumbnail) embed.setThumbnail(thumbnail);
                    textChannel.send({
                        embeds: [embed]
                    }).then(m => music.oldVoiceStateUpdateMessage = m.id).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
                } else {
                    music.oldVoiceStateUpdateMessage = null;
                }
                music.player?.pause(false);
            } catch (e) { this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e); }
        }
    }
}
