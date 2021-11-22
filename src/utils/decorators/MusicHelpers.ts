import { inhibit } from "./Inhibit";
import { VoiceChannel } from "discord.js";

export function isMusicPlaying(): any {
    return inhibit(ctx => {
        if (!ctx.guild!.music.player?.queue.current) return "I'm not playing anything right now";
    });
}

export function isSameVoiceChannel(): any {
    return inhibit(ctx => {
        if (ctx.guild!.me!.voice.channelId && ctx.guild!.me!.voice.channelId !== ctx.member!.voice.channelId) {
            return `I'm already used on ${ctx.guild!.me!.voice.channel!.toString()}`;
        }
    });
}

export function isMemberInVoiceChannel(): any {
    return inhibit(ctx => {
        if (!ctx.member!.voice.channelId) {
            return "Please join a voice channel";
        }
    });
}

export function isMemberVoiceChannelJoinable(ignoreWhenSame = true): any {
    return inhibit(ctx => {
        const vc = ctx.guild?.channels.cache.get(ctx.member!.voice.channelId!) as VoiceChannel|null;
        if (ignoreWhenSame && ctx.guild!.me!.voice.channelId && ctx.guild!.me!.voice.channelId === ctx.member!.voice.channelId) return undefined;
        if (!vc?.permissionsFor(ctx.guild!.me!)!.has(["CONNECT", "SPEAK"])) {
            return "I'm missing `CONNECT` or `SPEAK` permission in your voice!";
        }
        if (!vc.joinable) return "I can't join your voice channel";
    });
}

export function isInStream(): any {
    return inhibit(ctx => {
        if (ctx.guild!.music.player?.queue.current?.isStream) {
            return "Try to stop the stream first";
        }
    });
}

export function isHasQueue(): any {
    return inhibit(ctx => {
        if (!ctx.guild!.music.player!.queue.length) {
            return "This guild has no queue";
        }
    });
}

export function isMemberDJ(): any {
    return inhibit(async ctx => {
        const data = await ctx.client.databases.guilds.get(ctx.guild!.id);
        if (data.dj_only && data.dj_role) {
            const djRole = ctx.guild!.roles.resolve(data.dj_role);
            if (djRole && !ctx.member!.roles.cache.has(djRole.id)) {
                return `Sorry, but my commands are restricted only for those who has ${djRole.name} role`;
            }
        }
    });
}
