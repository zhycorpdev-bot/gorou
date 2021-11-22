import { Channel, Guild, GuildMember, Message, User, Collection, Snowflake } from "discord.js";
import { BotClient } from "../structures/BotClient";
import { createEmbed } from "./createEmbed";
import { formatMS } from "./formatMS";
import { MusicHandler } from "./MusicHandler";
import { APIMessage } from "discord-api-types/v9";
import { resolve } from "path/posix";
import { CustomError } from "./CustomError";

export class Util {
    public constructor(public client: BotClient) {}

    public bytesToSize(bytes: number): string {
        if (isNaN(bytes) && bytes !== 0) throw new Error(`[bytesToSize] (bytes) Error: bytes is not a Number/Integer, received: ${typeof bytes}`);
        const sizes: string[] = ["B", "KiB", "MiB", "GiB", "TiB", "PiB"];
        if (bytes < 2 && bytes > 0) return `${bytes} Byte`;
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
        if (i === 0) return `${bytes} ${sizes[i]}`;
        if (!sizes[i]) return `${bytes} ${sizes[sizes.length - 1]}`;
        return `${Number(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    }

    public getPackageJSON(pkgName = process.cwd()): Promise<any> {
        if (process.platform === "win32") pkgName = pkgName.replace("/", "\\");
        const resolvedPath = resolve(require.resolve(pkgName));
        return import(resolve(resolvedPath.split(pkgName)[0], pkgName, "package.json"));
    }

    public async getResource<T extends keyof getResourceResourceType>(type: T | keyof getResourceResourceType): Promise<getResourceReturnType<T>> {
        // Functions how to get the resources
        const resourcesFunctions: Record<keyof getResourceResourceType, (client: BotClient) => Collection<any, any>> = {
            users: (client: BotClient) => client.users.cache,
            channels: (client: BotClient) => client.channels.cache,
            guilds: (client: BotClient) => client.guilds.cache,
            queues: (client: BotClient) => client._music.cache.mapValues(v => v)
        };

        /*
            Why do we convert these functions to string? because we can't pass a function to a broadcastEval context, so we convert them to string.
            Then in the broadcastEval context, we convert them again to function using eval, then execute that function
        */
        const doBroadcastEval = (): any => this.client.shard?.broadcastEval(
            // eslint-disable-next-line no-eval
            (client, ctx) => eval(ctx.resourcesFunctions[ctx.type])(client),
            { context: { type, resourcesFunctions: Object.fromEntries(Object.entries(resourcesFunctions).map(o => [o[0], o[1].toString()])) } }
        );

        const evalResult = await doBroadcastEval() ?? resourcesFunctions[type](this.client);

        let result: getResourceReturnType<T>;
        if (this.client.shard) {
            result = new Collection<Snowflake, getResourceResourceType[T]>(
                await this.mergeBroadcastEval<getResourceResourceType[T]>(evalResult as (getResourceResourceType[T])[][])
            );
        } else { result = evalResult as getResourceReturnType<T>; }
        return result;
    }

    public async getGuildsCount(): Promise<number> {
        return (await this.getResource("guilds")).size;
    }

    public async getChannelsCount(filter = true): Promise<number> {
        const channels = await this.getResource("channels");

        if (filter) return channels.filter(c => c.type !== "GUILD_CATEGORY" && c.type !== "DM").size;
        return channels.size;
    }

    public async getUsersCount(filter = true): Promise<number> {
        const users = await this.getResource("users");

        if (filter) return users.filter(u => u.id !== this.client.user!.id).size;
        return users.size;
    }

    public async getTotalPlaying(): Promise<number> {
        return (await this.getResource("queues")).filter(q => q.player?.playing === true).size;
    }

    public mergeBroadcastEval<T>(broadcastEval: T[][]): Iterable<[Snowflake, T]> {
        return broadcastEval.reduce((p, c) => [...p, ...c]) as Iterable<[Snowflake, T]>;
    }

    public convertToMessage(msg: APIMessage|Message): Message {
        if (!(msg instanceof Message)) {
            // @ts-expect-error-next-line
            const newMsg = new Message(this.client, msg);
            newMsg._patch(msg);
            return newMsg;
        }
        return msg;
    }

    public doTimeout(vcMembers: GuildMember[], music: MusicHandler): any {
        try {
            if (vcMembers.length !== 0) return undefined;
            clearTimeout(music.timeout!);
            music.timeout = undefined;
            music.player!.pause(true);
            const timeout = this.client.config.deleteQueueTimeout;
            const duration = formatMS(timeout);
            const textChannel = this.client.channels.cache.get(music.player!.textChannel!);
            music.oldVoiceStateUpdateMessage = null;
            music.timeout = setTimeout(() => {
                if (textChannel?.isText()) {
                    void textChannel.send({
                        embeds: [
                            createEmbed("error", `**${duration}** have passed and there is no one who joins my voice channel, the queue was deleted.`)
                                .setTitle("⏹ Queue deleted.")
                        ]
                    }).catch(e => { this.client.logger.error(CustomError("VOICE_STATE_UPDATE_EVENT_ERR:", String(e))); return null; })
                        .then(async msg => {
                            if (msg?.channelId === music.playerChannel) {
                                const ch = music.guild.channels.cache.get(music.playerChannel);
                                if (ch?.isText()) {
                                    const old = await ch.messages.fetch(music.oldVoiceStateUpdateMessage!, { cache: false }).catch(() => null);
                                    if (old) old.delete().catch(() => null);
                                }
                                setTimeout(() => msg.delete().catch(e => this.client.logger.error(CustomError("VOICE_STATE_UPDATE_EVENT_ERR:", String(e)))), 5000);
                            }
                            await music.reset();
                            music.oldVoiceStateUpdateMessage = null;
                        });
                }
                music.player?.destroy();
            }, timeout);
            if (textChannel?.isText()) {
                textChannel.send({
                    embeds: [
                        createEmbed("warn", "Everyone has left from my voice channel, to save resources, the queue was paused. " +
                        `If there's no one who joins my voice channel in the next **${duration}**, the queue will be deleted.`)
                            .setTitle("⏸ Queue paused.")
                    ]
                }).then(msg => music.oldVoiceStateUpdateMessage = msg.id).catch(e => this.client.logger.error(CustomError("VOICE_STATE_UPDATE_EVENT_ERR:", String(e))));
            }
        } catch (e) { this.client.logger.error(CustomError("VOICE_STATE_UPDATE_EVENT_ERR:", String(e))); }
    }

    public resumeTimeout(vcMembers: GuildMember[], music: MusicHandler): any {
        if (vcMembers.length > 0) {
            if (music.player?.playing) return undefined;
            try {
                const textChannel = this.client.channels.cache.get(music.player!.textChannel!);
                clearTimeout(music.timeout!);
                music.timeout = undefined;
                const song = music.player!.queue.current;
                if (textChannel?.isText() && textChannel.id !== music.playerChannel) {
                    const embed = createEmbed("info", `Someone joins the voice channel. Enjoy the music 🎶\nNow Playing: **[${song!.title}](${(song as any).url})**`)
                        .setTitle("▶ Queue resumed");
                    // @ts-expect-error-next-line
                    const thumbnail = song?.displayThumbnail("maxresdefault");
                    if (thumbnail) embed.setThumbnail(thumbnail);
                    textChannel.send({
                        embeds: [embed]
                    }).then(m => music.oldVoiceStateUpdateMessage = m.id).catch(e => this.client.logger.error("VOICE_STATE_UPDATE_EVENT_ERR:", e));
                } else {
                    music.oldVoiceStateUpdateMessage = null;
                }
                music.player?.pause(false);
            } catch (e) { this.client.logger.error(CustomError("VOICE_STATE_UPDATE_EVENT_ERR:", String(e))); }
        }
    }

    public async getPlayerMessage(guild: Guild): Promise<Message|null> {
        const channel = this.client.channels.cache.get(guild.music.playerChannel);
        if (channel?.isText()) {
            const msg = await channel.messages.fetch(guild.music.playerMessage).catch(() => null);
            return msg;
        }
        return null;
    }
}

interface getResourceResourceType {
    users: User;
    channels: Channel;
    guilds: Guild;
    queues: MusicHandler;
}
type getResourceReturnType<T extends keyof getResourceResourceType> = Collection<Snowflake, getResourceResourceType[T]>;
