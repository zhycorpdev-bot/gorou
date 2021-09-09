import { VoiceState } from "discord.js";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("voiceStateUpdate")
export class VoiceStateUpdateEvent extends BaseListener {
    public execute(oldState: VoiceState, newState: VoiceState): any {
        const { music } = newState.guild;

        if (!music.player) return undefined;

        const newVC = newState.channel;
        const oldVC = oldState.channel;
        const oldID = oldVC?.id;
        const newID = newVC?.id;
        const queueVC = music.player.voiceChannel!;
        const oldMember = oldState.member;
        const member = newState.member;
        const queueVCMembers = music.listeners;
        const botID = this.client.user?.id;
        const textChannel = this.client.channels.cache.get(music.player.textChannel!);

        if (oldMember?.id === botID && oldID === queueVC && newID === undefined) {
            try {
                music.player.destroy();
                void music.reset();
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Disconnected from the voice channel at ${newState.guild.name}, the queue was deleted.`);
                if (textChannel?.isText()) {
                    textChannel.send({
                        embeds: [
                            createEmbed("warn", "I was disconnected from the voice channel, the queue will be deleted")
                        ]
                    }).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
                }
            } catch (e) {
                this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e);
            }
        }

        if (newState.mute !== oldState.mute || newState.deaf !== oldState.deaf) return undefined;

        // Handle when user leaves voice channel
        if (oldID === queueVC && newID !== queueVC && !member?.user.bot && !music.timeout) this.client.util.doTimeout(queueVCMembers, music);

        // Handle when user joins voice channel or bot gets moved
        if (newID === queueVC && !member?.user.bot) this.client.util.resumeTimeout(queueVCMembers, music);
    }
}
