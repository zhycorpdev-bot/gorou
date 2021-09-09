import { Node } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("nodeDisconnect", "erela")
export class NodeDisconnectEvent extends BaseListener {
    public execute(node: Node, reason: { code: number; reason: string }): void {
        this.client.logger.info(`${node.options.identifier!} has disconnected with code ${reason.code}. Reason: ${reason.reason}`);
    }
}
