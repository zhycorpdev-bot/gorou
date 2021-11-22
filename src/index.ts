import "dotenv/config";
import "./extension/Global";
import { resolve } from "path";
import { ShardingManager } from "discord.js";
import { createLogger } from "./utils/Logger";
import { shardsCount as totalShards, isDev } from "./config";
const log = createLogger(`shardingmanager`, "en-US", "manager", undefined, isDev);

process.on("uncaughtException", e => {
    log.fatal(e);
    process.exit(1);
});

// @ts-expect-error Ignore next line
if (process[Symbol.for("ts-node.register.instance")]) {
    log.warn("ts-node detected, sharding is disabled. Please only use ts-node for development purposes.");
    require("./bot");
} else {
    const manager = new ShardingManager(resolve(__dirname, "bot.js"), {
        totalShards,
        mode: "worker",
        respawn: true,
        token: process.env.SECRET_DISCORD_TOKEN
    });

    manager.on("shardCreate", shard => {
        log.info(`[ShardManager] Shard #${shard.id} Spawned.`);
        shard.on("disconnect", () => {
            log.warn("SHARD_DISCONNECTED: ", { stack: `[ShardManager] Shard #${shard.id} Disconnected` });
        }).on("reconnecting", () => {
            log.info(`[ShardManager] Shard #${shard.id} Reconnected.`);
        });
        if (manager.shards.size === manager.totalShards) log.info("[ShardManager] All shards spawned successfully.");
    }).spawn().catch(e => log.error(e.status ? `Error while fetching recommended shards: ${e.status}, ${e.statusText}` : e));
}
