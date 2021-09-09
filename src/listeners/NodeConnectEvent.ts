import { Node } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("nodeConnect", "erela")
export class NodeConnectEvent extends BaseListener {
    public execute(node: Node): void {
        this.client.logger.info(`${node.options.identifier!} has connected`);
    }
}
