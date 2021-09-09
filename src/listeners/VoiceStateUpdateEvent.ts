import { VoiceState } from "discord.js";
import { BaseListener } from "../structures/BaseListener";
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
        const member = newState.member;
        const queueVCMembers = music.listeners;

        if (newState.mute !== oldState.mute || newState.deaf !== oldState.deaf) return undefined;

        // Handle when user leaves voice channel
        if (oldID === queueVC && newID !== queueVC && !member?.user.bot && !music.timeout) this.client.util.doTimeout(queueVCMembers, music);

        // Handle when user joins voice channel or bot gets moved
        if (newID === queueVC && !member?.user.bot && music.timeout) this.client.util.resumeTimeout(queueVCMembers, music);
    }
}
