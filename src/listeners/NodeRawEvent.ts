import { BaseListener } from "../structures/BaseListener";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("nodeRaw", "erela")
export class NodeRawEvent extends BaseListener {
    public async execute(payload: any): Promise<void> {
        if (payload?.op === "playerUpdate" && payload.state.connected) {
            const manager = this.client._music.fetch(String(payload.guildId));
            if (Boolean(manager)) {
                await manager.updatePlayerEmbed();
            }
        }
    }
}
