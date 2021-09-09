import { Guild, TextChannel, User, VoiceChannel, GuildMember, Snowflake } from "discord.js";
import { BotClient } from "../structures/BotClient";
import { readableTime } from "./readableTime";
import { Node, Player } from "erela.js";

export enum LoopType {
    NONE,
    ALL,
    ONE
}

export type Filters = "vibrato"|"vaporwave"|"tremolo"|"nightcore"|"karaoke"|"eightD"|"distortion";

export class MusicHandler {
    public client: BotClient = this.guild.client;
    public skipVotes: User[] = [];
    public timeout?: NodeJS.Timeout;
    private _lastMusicMessageID: Snowflake | null = null;
    private _lastVoiceStateUpdateMessageID: Snowflake | null = null;
    private _lastExceptionMessageID: Snowflake | null = null;
    public constructor(public readonly guild: Guild) {}

    public reset(): void {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = undefined;
        this.oldMusicMessage = null;
        this.oldExceptionMessage = null;
        this.oldVoiceStateUpdateMessage = null;
        this.skipVotes = [];
    }

    public async play(): Promise<any> {
        this.skipVotes = [];
        await this.player!.play();
    }

    public async join(vc: VoiceChannel|string, channel?: TextChannel): Promise<void> {
        const player = await this.client.music.create({
            guild: this.guild.id,
            voiceChannel: typeof vc === "string" ? vc : vc.id,
            textChannel: channel!.id,
            selfDeafen: true
        });
        await player.connect();
    }

    public async seek(time: number): Promise<void> {
        await this.player!.seek(time);
    }

    public setLoop(type: LoopType): void {
        switch (type) {
            case LoopType.NONE:
                this.player!.setTrackRepeat(false);
                this.player!.setQueueRepeat(false);
                break;
            case LoopType.ALL:
                this.player!.setQueueRepeat(true);
                break;
            case LoopType.ONE:
                this.player!.setTrackRepeat(true);
                break;
        }
    }

    public get player(): Player | undefined {
        return this.client.music.players.get(this.guild.id);
    }

    public get voiceChannel(): VoiceChannel|null {
        return this.guild.me!.voice.channel as any;
    }

    public get playTime(): number {
        return this.player!.position;
    }

    public get readablePlayTime(): string {
        return readableTime(this.player!.position);
    }

    public get listeners(): GuildMember[] {
        return this.voiceChannel ? [...this.voiceChannel.members.filter(x => !x.user.bot && !x.voice.deaf).values()] : [];
    }

    public get node(): Node {
        return this.client.music.nodes.filter(x => x.connected).random();
    }

    public get loopType(): LoopType {
        if (!this.player) return LoopType.NONE;
        if (this.player.queueRepeat) return LoopType.ALL;
        if (this.player.trackRepeat) return LoopType.ONE;
        return LoopType.NONE;
    }

    public get oldExceptionMessage(): Snowflake | null {
        return this._lastExceptionMessageID;
    }

    public set oldExceptionMessage(id: Snowflake|null) {
        if (this._lastExceptionMessageID !== null) {
            const textChannel = this.client.channels.cache.get(String(this.player?.textChannel)) as TextChannel|null;
            if (textChannel?.isText()) {
                textChannel.messages.fetch(this._lastExceptionMessageID, { cache: false })
                    .then(m => m.delete())
                    .catch(e => this.client.logger.error("DELETE_OLD_EXCEPTION_MESSAGE_ERR:", e));
            }
        }
        this._lastExceptionMessageID = id;
    }

    public get oldMusicMessage(): Snowflake | null {
        return this._lastMusicMessageID;
    }

    public set oldMusicMessage(id: Snowflake | null) {
        if (this._lastMusicMessageID !== null) {
            const textChannel = this.client.channels.cache.get(String(this.player?.textChannel)) as TextChannel|null;
            if (textChannel?.isText()) {
                textChannel.messages.fetch(this._lastMusicMessageID, { cache: false })
                    .then(m => m.delete())
                    .catch(e => this.client.logger.error("DELETE_OLD_MUSIC_MESSAGE_ERR:", e));
            }
        }
        this._lastMusicMessageID = id;
    }

    public get oldVoiceStateUpdateMessage(): Snowflake | null {
        return this._lastVoiceStateUpdateMessageID;
    }

    public set oldVoiceStateUpdateMessage(id: Snowflake | null) {
        if (this._lastVoiceStateUpdateMessageID !== null) {
            const textChannel = this.client.channels.cache.get(String(this.player?.textChannel)) as TextChannel|null;
            if (textChannel?.isText()) {
                textChannel.messages.fetch(this._lastVoiceStateUpdateMessageID, { cache: false })
                    .then(m => m.delete())
                    .catch(e => this.client.logger.error("DELETE_OLD_VOICE_STATE_UPDATE_MESSAGE_ERR:", e));
            }
        }
        this._lastVoiceStateUpdateMessageID = id;
    }
}
