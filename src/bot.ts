import { BotClient } from "./structures/BotClient";
import { clientOptions } from "./config";
import { CustomError } from "./utils/CustomError";

export const client = new BotClient(clientOptions);

process.on("unhandledRejection", e => {
    if (e instanceof Error) {
        client.logger.error(e);
    } else {
        client.logger.error(CustomError("PromiseError", e as string));
    }
});
process.on("uncaughtException", e => {
    client.logger.fatal(e);
    process.exit(1);
});

client.build(process.env.SECRET_DISCORD_TOKEN!)
    .catch(e => client.logger.error(e));
