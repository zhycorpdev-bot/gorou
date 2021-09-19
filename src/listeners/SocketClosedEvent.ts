import { Player } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("socketClosed", "erela")
export class SocketClosedEvent extends BaseListener {
    public async execute(player: Player): Promise<void> {
        if (player.paused) player.pause(false);
    }
}
