import { Player, Track, TrackExceptionEvent } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("trackError", "erela")
export class TrackErrorEvent extends BaseListener {
    public async execute(player: Player, track: Track, payload: TrackExceptionEvent): Promise<void> {
        const manager = this.client._music.fetch(player.guild);
        if (manager.lastExceptionMsg) {
            await manager.lastExceptionMsg.delete();
            manager.lastExceptionMsg = undefined;
        }
        const channel = this.client.channels.cache.get(player.textChannel!);
        if (channel?.isText()) {
            manager.lastExceptionMsg = await channel.send({
                embeds: [
                    createEmbed("error", `There is an exception while trying to play this track:\n\`\`\`java\n${payload.exception!.message}\`\`\``, true)
                ]
            });
        }
    }
}
