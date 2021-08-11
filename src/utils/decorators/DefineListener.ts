import { IListener } from "../../typings";
import { BotClient } from "../../structures/BotClient";

export function DefineListener(name: IListener["name"]): any {
    return function decorate<T extends IListener>(target: new (...args: any[]) => T): new (client: BotClient) => T {
        return new Proxy(target, {
            construct: (ctx, [client]): T => new ctx(client, name)
        });
    };
}
