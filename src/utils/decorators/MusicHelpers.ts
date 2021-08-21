import { inhibit } from "./Inhibit";

export function isMusicPlaying(): any {
    return inhibit(msg => {
        if (!msg.guild!.music.player?.queue.current) return "I'm not playing anything right now";
    });
}

export function isSameVoiceChannel(): any {
    return inhibit(msg => {
        if (msg.guild!.me!.voice.channelId && msg.guild!.me!.voice.channelId !== msg.member!.voice.channelId) {
            return `I'm already used on ${msg.guild!.me!.voice.channel!.toString()}`;
        }
    });
}

export function isMemberInVoiceChannel(): any {
    return inhibit(msg => {
        if (!msg.member!.voice.channelId) {
            return "Please join a voice channel";
        }
    });
}

export function isMemberVoiceChannelJoinable(ignoreWhenSame = true): any {
    return inhibit(msg => {
        const vc = msg.member!.voice.channel!;
        if (ignoreWhenSame && msg.guild!.me!.voice.channelId && msg.guild!.me!.voice.channelId === msg.member!.voice.channelId) return undefined;
        if (!vc.permissionsFor(msg.guild!.me!)!.has(["CONNECT", "SPEAK"])) {
            return "I'm missing `CONNECT` or `SPEAK` permission in your voice!";
        }
        if (!vc.joinable) return "I can't join your voice channel";
    });
}

export function isInStream(): any {
    return inhibit(msg => {
        if (msg.guild!.music.player?.queue.current?.isStream) {
            return "Try to stop the stream first";
        }
    });
}

export function isHasQueue(): any {
    return inhibit(msg => {
        if (!msg.guild!.music.player!.queue.length) {
            return "This guild has no queue";
        }
    });
}
