import { inhibit, inhibitInteraction } from "./Inhibit";

export function isMusicPlaying(interaction = false): any {
    if (interaction) {
        return inhibitInteraction(interaction => {
            if (!interaction.guild!.music.player?.queue.current) return "I'm not playing anything right now";
        });
    }
    return inhibit(msg => {
        if (!msg.guild!.music.player?.queue.current) return "I'm not playing anything right now";
    });
}

export function isSameVoiceChannel(interaction = false): any {
    if (interaction) {
        return inhibitInteraction(interaction => {
            const member = interaction.guild!.members.resolve(interaction.user.id);
            if (interaction.guild!.me!.voice.channelId && interaction.guild!.me!.voice.channelId !== member!.voice.channelId) {
                return `I'm already used on ${interaction.guild!.me!.voice.channel!.toString()}`;
            }
        });
    }
    return inhibit(msg => {
        if (msg.guild!.me!.voice.channelId && msg.guild!.me!.voice.channelId !== msg.member!.voice.channelId) {
            return `I'm already used on ${msg.guild!.me!.voice.channel!.toString()}`;
        }
    });
}

export function isMemberInVoiceChannel(interaction = false): any {
    if (interaction) {
        return inhibitInteraction(interaction => {
            const member = interaction.guild!.members.resolve(interaction.user.id);
            if (!member!.voice.channelId) return "Please join a voice channel";
        });
    }
    return inhibit(msg => {
        if (!msg.member!.voice.channelId) {
            return "Please join a voice channel";
        }
    });
}

export function isMemberVoiceChannelJoinable(ignoreWhenSame = true, interaction = false): any {
    if (interaction) {
        return inhibitInteraction(interaction => {
            const member = interaction.guild!.members.resolve(interaction.user.id);
            const vc = member!.voice.channel!;
            if (ignoreWhenSame && interaction.guild!.me!.voice.channelId && interaction.guild!.me!.voice.channelId === member!.voice.channelId) return undefined;
            if (!vc.permissionsFor(interaction.guild!.me!)!.has(["CONNECT", "SPEAK"])) {
                return "I'm missing `CONNECT` or `SPEAK` permission in your voice!";
            }
            if (!vc.joinable) return "I can't join your voice channel";
        });
    }
    return inhibit(msg => {
        const vc = msg.member!.voice.channel!;
        if (ignoreWhenSame && msg.guild!.me!.voice.channelId && msg.guild!.me!.voice.channelId === msg.member!.voice.channelId) return undefined;
        if (!vc.permissionsFor(msg.guild!.me!)!.has(["CONNECT", "SPEAK"])) {
            return "I'm missing `CONNECT` or `SPEAK` permission in your voice!";
        }
        if (!vc.joinable) return "I can't join your voice channel";
    });
}

export function isInStream(interaction = false): any {
    if (interaction) {
        return inhibitInteraction(interaction => {
            if (interaction.guild!.music.player?.queue.current?.isStream) {
                return "Try to stop the stream first";
            }
        });
    }
    return inhibit(msg => {
        if (msg.guild!.music.player?.queue.current?.isStream) {
            return "Try to stop the stream first";
        }
    });
}

// export function isMemberDJ(): any {
//     return inhibit(msg => {
//         if (msg.guild!.setting?.dj_only && msg.guild!.setting.dj_role) {
//             const djRole = msg.guild!.roles.resolve(msg.guild!.setting.dj_role);
//             if (djRole && !msg.member!.roles.cache.has(djRole.id)) {
//                 return `Sorry, but my commands are restricted only for those who has ${djRole.name} role`;
//             }
//         }
//     });
// }

export function isHasQueue(interaction = false): any {
    if (interaction) {
        return inhibitInteraction(interaction => {
            if (!interaction.guild!.music.player!.queue.length) {
                return "This guild has no queue";
            }
        });
    }
    return inhibit(msg => {
        if (!msg.guild!.music.player!.queue.length) {
            return "This guild has no queue";
        }
    });
}
