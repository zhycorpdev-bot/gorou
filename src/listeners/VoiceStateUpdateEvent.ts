import { VoiceChannel, VoiceState } from "discord.js";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("voiceStateUpdate")
export class VoiceStateUpdateEvent extends BaseListener {
    public execute(oldState: VoiceState, newState: VoiceState): any {
        const { music } = newState.guild;

        if (!music.player) return undefined;

        const queueVC = newState.guild.channels.cache.get(music.player.voiceChannel!) as VoiceChannel;
        const oldMember = oldState.member;
        const member = newState.member;
        const queueVCMembers = queueVC.members.filter(m => !m.user.bot);
        const newVCMembers = newState.channel?.members.filter(m => !m.user.bot);
        const botID = this.client.user?.id;
        const textChannel = this.client.channels.cache.get(music.player.textChannel!);

        // Handle when bot gets kicked from the voice channel
        if (oldMember?.id === botID && oldState.channelId === queueVC.id && !newState.channelId) {
            try {
                newState.guild.music.player?.destroy();
                newState.guild.music.reset();
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Disconnected from the voice channel at ${newState.guild.name}, the queue was deleted.`);
                if (textChannel?.isText()) {
                    textChannel.send({
                        embeds: [
                            createEmbed("warn", "I was disconnected from the voice channel, the queue will be deleted")
                        ]
                    }).then(msg => {
                        music.oldMusicMessage = null; music.oldVoiceStateUpdateMessage = null;
                        if (msg.channelId === music.playerMessage?.channelId) {
                            setTimeout(() => msg.delete().catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e)), 5000);
                        }
                    }).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
                }
            } catch (e) {
                this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e);
            }
        }

        if (newState.mute !== oldState.mute || newState.deaf !== oldState.deaf) return undefined; // TODO: Handle all listeners deaf & bot muted event?

        // Handle when the bot is moved to another voice channel
        if (member?.id === botID && oldState.channelId === queueVC.id && newState.channelId !== queueVC.id && newState.channelId !== null) {
            if (!newVCMembers) return undefined;
            if (newVCMembers.size === 0 && music.timeout === undefined) this.client.util.doTimeout([...newVCMembers.values()], music);
            else if (newVCMembers.size !== 0 && music.timeout !== undefined) this.client.util.resumeTimeout([...newVCMembers.values()], music);
            music.player.setVoiceChannel(newState.channelId);
        }

        // Handle when user leaves voice channel
        if (oldState.channelId === queueVC.id && newState.channelId !== queueVC.id && !member?.user.bot && music.timeout === undefined) this.client.util.doTimeout([...queueVCMembers.values()], music);

        // Handle when user joins voice channel or bot gets moved
        if (newState.channelId === queueVC.id && !member?.user.bot) this.client.util.resumeTimeout([...queueVCMembers.values()], music);
    }
}
