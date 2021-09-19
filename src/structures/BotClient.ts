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
import Spotify from "better-erela.js-spotify";
import Filters from "erela.js-filter";
import { Util } from "../utils/Util";
import { GuildSettingManager } from "../utils/GuildSettingManager";
import { createConnection } from "typeorm";

export class BotClient extends Client {
    public readonly config = config;
    public readonly logger = createLogger("bot", this.config.isProd);
    public readonly request = got;
    public readonly music = new Manager({
        nodes: this.config.nodes,
        send: (id: string, payload: any) => {
            const guild = this.guilds.cache.get(id);
            if (guild) guild.shard.send(payload);
        },
        plugins: [
            new Spotify(),
            new Filters()
        ]
    });

    public readonly commands = new CommandManager(this, resolve(__dirname, "..", "commands"));
    // @ts-expect-error override
    public readonly listeners = new ListenerLoader(this, resolve(__dirname, "..", "listeners"));
    public readonly _music = new MusicManager(this);
    public readonly databases = {
        guilds: new GuildSettingManager(this)
    };

    public readonly util = new Util(this);

    public constructor(opt: ClientOptions) { super(opt); }

    public async build(token: string): Promise<BotClient> {
        const start = Date.now();
        this.listeners.load();
        this.on("raw", (d: any) => this.music.updateVoiceState(d));
        this.on("ready", async () => {
            await this.commands.load();
            await this.music.init(this.user!.id);
            await createConnection({
                database: "gorou",
                entities: [`${resolve(__dirname, "..", "entities")}/**/*.ts`, `${resolve(__dirname, "..", "entities")}/**/*.js`],
                type: "mongodb",
                url: process.env.DATABASE!,
                useUnifiedTopology: true
            }).catch(e => {
                this.logger.error("MONGODB_CONN_ERR:", e);
                this.logger.warn("Couldn't connect to database. Exiting...");
                return process.exit(1);
            }).then(async () => {
                this.logger.info("Connected to MongoDB cloud");
                await this.databases.guilds._init();
            });
            await this.commands.load();
            this.logger.info(`Ready took ${formatMS(Date.now() - start)}`);
        });
        await this.login(token);
        return this;
    }
}
