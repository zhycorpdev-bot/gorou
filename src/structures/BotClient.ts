/* eslint-disable @typescript-eslint/no-misused-promises */
import { Client, ClientOptions } from "discord.js";
import got from "got";
import { resolve } from "path";
import * as config from "../config";
import { CommandManager } from "../utils/CommandManager";
import { createLogger } from "../utils/Logger";
import { formatMS } from "../utils/formatMS";
import { ListenerLoader } from "../utils/ListenerLoader";
import { MusicManager } from "../utils/MusicManager";
import "../extension";
import { Manager } from "erela.js";
import { createEmbed } from "../utils/createEmbed";

export class BotClient extends Client {
    public readonly config = config;
    public readonly logger = createLogger("bot", this.config.isProd);
    public readonly request = got;
    public readonly music = new Manager({
        nodes: this.config.nodes,
        send: (id: string, payload: any) => {
            const guild = this.guilds.cache.get(id);
            if (guild) guild.shard.send(payload);
        }
    });

    public readonly commands = new CommandManager(this, resolve(__dirname, "..", "commands"));
    // @ts-expect-error override
    public readonly listeners = new ListenerLoader(this, resolve(__dirname, "..", "listeners"));
    public readonly _music = new MusicManager(this);
    public constructor(opt: ClientOptions) { super(opt); }

    public async build(token: string): Promise<BotClient> {
        const start = Date.now();
        this.listeners.load();
        this.on("raw", (d: any) => this.music.updateVoiceState(d));
        this.on("ready", async () => {
            await this.commands.load();
            await this.music.init(this.user!.id);
            this.music.on("nodeConnect", node => this.logger.info(`${node.options.identifier!} has connected`));
            this.music.on("nodeError", (node, error) => this.logger.error("ERELA_ERR:", error));
            this.music.on("nodeDisconnect", (node, reason) => this.logger.info(`${node.options.identifier!} has disconnected with code ${reason.code!}. Reason: ${reason.reason!}`));
            this.music.on("trackStart", async (player, track) => {
                const channel = this.channels.cache.get(player.textChannel!);
                if (channel?.isText()) {
                    await channel.send({
                        embeds: [
                            createEmbed("info", `**Started** playing: **[${track.title}](${track.uri})**`, false)
                        ]
                    }).then(x => setTimeout(() => x.delete(), track.duration));
                }
            });
            this.music.on("trackError", async (player, track, payload) => {
                const manager = this._music.fetch(player.guild);
                if (manager.lastExceptionMsg) {
                    await manager.lastExceptionMsg.delete();
                    manager.lastExceptionMsg = undefined;
                }
                const channel = this.channels.cache.get(player.textChannel!);
                if (channel?.isText()) {
                    manager.lastExceptionMsg = await channel.send({
                        embeds: [
                            createEmbed("error", `There is an exception while trying to play a track:\n\`\`\`java\n${payload.exception!.message}\`\`\``, true)
                        ]
                    });
                }
            });
            this.music.on("queueEnd", async player => {
                const manager = this._music.fetch(player.guild);
                const channel = this.channels.cache.get(player.textChannel!);
                if (channel?.isText()) {
                    await channel.send({
                        embeds: [
                            createEmbed("info", "We've run out of songs! Better queue up some more tunes.", false)
                        ]
                    });
                }
                manager.reset();
                void player.destroy();
            });
            this.music.on("socketClosed", player => {
                const manager = this._music.fetch(player.guild);
                manager.reset();
                void player.destroy();
            });
            this.logger.info(`Ready took ${formatMS(Date.now() - start)}`);
        });
        await this.login(token);
        return this;
    }
}
