import { Player, Track } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("trackEnd", "erela")
export class TrackEndEvent extends BaseListener {
    public async execute(player: Player, track: Track): Promise<void> {
        const manager = this.client._music.fetch(player.guild);
        if (manager.oldMusicMessage) {
            manager.oldMusicMessage = null;
        }
        await manager.updatePlayerEmbed();
        this.client.logger.info(`Track: "${track.title}" on ${manager.guild.name} ended`);
    }
}
