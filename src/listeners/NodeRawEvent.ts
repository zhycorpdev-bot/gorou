import { BaseListener } from "../structures/BaseListener";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("nodeRaw", "erela")
export class NodeRawEvent extends BaseListener {
    public async execute(payload: any): Promise<void> {
        if (this.client.config.isDev) this.client.logger.debug(payload, `[WS => Lavalink] [${payload.op}]:`);
        if (payload?.op === "playerUpdate" && payload.state.connected && this.client.config.enableProgressBar) {
            const manager = this.client.queue.fetch(String(payload.guildId));
            if (Boolean(manager)) {
                await manager.updatePlayerEmbed();
            }
        }
    }
}
