import { Player, Track, TrackExceptionEvent } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("trackError", "erela")
export class TrackErrorEvent extends BaseListener {
    public async execute(player: Player, track: Track, payload: TrackExceptionEvent): Promise<void> {
        const manager = this.client._music.fetch(player.guild);
        if (manager.oldExceptionMessage) {
            manager.oldExceptionMessage = null;
        }
        const channel = this.client.channels.cache.get(player.textChannel!);
        if (channel?.isText()) {
            const msg = await channel.send({
                embeds: [
                    createEmbed("error", `There is an exception while trying to play this track:\n\`\`\`java\n${payload.exception!.message}\`\`\``, true)
                ]
            });
            manager.oldExceptionMessage = msg.id;
            if (manager.playerMessage) {
                setTimeout(() => manager.oldExceptionMessage = null, 20000);
            }
        }
    }
}
