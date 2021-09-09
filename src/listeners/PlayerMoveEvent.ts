import { VoiceChannel } from "discord.js";
import { Player } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("playerMove", "erela")
export class PlayerMoveEvent extends BaseListener {
    public async execute(player: Player, oldCh: string, newCh: string|null): Promise<any> {
        const newVC = this.client.channels.cache.get(newCh!) as VoiceChannel|null;
        const newVCMembers = newVC?.members.filter(m => !m.user.bot);
        const music = this.client._music.fetch(player.guild);
        const textChannel = this.client.channels.cache.get(player.textChannel!);

        if (newCh) {
            if (newVCMembers?.size === 0 && !music.timeout) this.client.util.doTimeout([...newVCMembers.values()], music);
            else if (newVCMembers?.size !== 0 && music.timeout) this.client.util.resumeTimeout([...newVCMembers!.values()], music);
            player.setVoiceChannel(newCh);
        }

        if (!newCh) {
            try {
                player.destroy();
                void music.reset();
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} Disconnected from the voice channel at ${music.guild.name}, the queue was deleted.`);
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
    }
}
