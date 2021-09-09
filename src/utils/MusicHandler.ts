import { Guild, Message, TextChannel, User, VoiceChannel, GuildMember } from "discord.js";
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
    public lastExceptionMsg?: Message;
    public timeout?: NodeJS.Timeout;
    public oldMusicMessage?: Message;
    public oldVoiceStateUpdateMessage?: Message;

    public constructor(public readonly guild: Guild) {}

    public reset(): void {
        clearTimeout(this.timeout!);
        Object.assign(this, {
            lastExceptionMsg: undefined,
            oldMusicMessage: undefined,
            oldVoiceStateUpdateMessage: undefined,
            skipVotes: [],
            timeout: undefined
        });
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
}
