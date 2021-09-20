import { Player, WebSocketClosedEvent } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { DefineListener } from "../utils/decorators/DefineListener";

const allowedOpCodes = [4006, 4015, 4011, 4012];

@DefineListener("socketClosed", "erela")
export class SocketClosedEvent extends BaseListener {
    public async execute(player: Player, payload: WebSocketClosedEvent): Promise<void> {
        if (allowedOpCodes.includes(payload.code)) {
            setTimeout(() => player.pause(true), 100);
            setTimeout(() => player.pause(false), 300);
        }
    }
}
