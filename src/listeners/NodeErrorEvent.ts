import { Node } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("nodeError", "erela")
export class NodeErrorEvent extends BaseListener {
    public execute(node: Node, err: any): void {
        this.client.logger.error("NODE_ERELA_ERR:", err);
    }
}
