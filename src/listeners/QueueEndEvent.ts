import { Player } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("queueEnd", "erela")
export class QueueEndEvent extends BaseListener {
    public async execute(player: Player): Promise<void> {
        const manager = this.client.queue.fetch(player.guild);
        const channel = this.client.channels.cache.get(player.textChannel!);
        if (channel?.isText() && !manager.playerMessage) {
            await channel.send({
                embeds: [
                    createEmbed("info", "We've run out of songs! Better queue up some more tunes.", false)
                ]
            });
        }
        await manager.reset();
        await player.destroy();
    }
}
