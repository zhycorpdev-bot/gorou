import { Manager as OManager, Player, VoicePacket } from "erela.js";

const TEMPLATE = JSON.stringify(["event", "guildId", "op", "sessionId"]);

export class Manager extends OManager {
    public updateVoiceState(data: VoicePacket|undefined): void {
        if (!data || !["VOICE_SERVER_UPDATE", "VOICE_STATE_UPDATE"].includes(data.t || "")) return;
        const player = this.players.get(data.d.guild_id) as Player|null;

        if (!player) return;
        const state = player.voiceState;

        if (data.t === "VOICE_SERVER_UPDATE") {
            state.op = "voiceUpdate";
            state.guildId = data.d.guild_id;
            state.event = data.d;
        } else {
            if (data.d.user_id !== this.options.clientId) return;
            state.sessionId = data.d.session_id;
            if (player.voiceChannel !== data.d.channel_id) {
                this.emit("playerMove", player, player.voiceChannel, data.d.channel_id);
            }
        }

        player.voiceState = state;
        if (JSON.stringify(Object.keys(state).sort()) === TEMPLATE) {
            void player.node.send(state);
        }
    }
}
