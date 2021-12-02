/* eslint-disable @typescript-eslint/no-unused-vars */
import { MessageReaction, Message, User, VoiceChannel } from "discord.js";
import { BaseListener } from "../structures/BaseListener";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";
import { LoopType } from "../utils/MusicHandler";
import { CommandContext } from "../structures/CommandContext";

@DefineListener("messageReactionAdd")
export class MessageReactionAddEvent extends BaseListener {
    public async execute(messageReaction: MessageReaction, user: User): Promise<any> {
        // if (!messageReaction.message.guild || user.equals(this.client.user!)) return undefined;
        // const { message, message: { guild }, message: { guild: { music } } } = messageReaction;
        // const data = await this.client.databases.guilds.get(guild.id);
        // if (data.requesterMessage === message.id) {
        //     const emojis = [
        //         {
        //             emoji: "⏯",
        //             command: "resumepause"
        //         },
        //         {
        //             emoji: "⏭",
        //             command: "skip"
        //         },
        //         {
        //             emoji: "🔁",
        //             command: "loop"
        //         },
        //         {
        //             emoji: "⏹",
        //             command: "stop"
        //         },
        //         {
        //             emoji: "🔀",
        //             command: "shuffle"
        //         }
        //     ];
        //     await messageReaction.users.remove(user);
        //     if (!music.player) {
        //         const msg = await message.channel.send({
        //             embeds: [createEmbed("error", "I'm not playing anything right now", true)]
        //         });
        //         setTimeout(() => msg.delete().catch(() => null), 5000);
        //         return undefined;
        //     }
        //     const member = guild.members.cache.get(user.id)!;
        //     const vc = guild.channels.cache.get(member.voice.channelId!) as VoiceChannel|null;
        //     if (!vc) {
        //         const msg = await message.channel.send({
        //             embeds: [createEmbed("error", "Please join a voice channel", true)]
        //         });
        //         setTimeout(() => msg.delete().catch(() => null), 5000);
        //         return undefined;
        //     }
        //     if (guild.me!.voice.channelId && guild.me!.voice.channelId !== member.voice.channelId) {
        //         const msg = await message.channel.send({
        //             embeds: [createEmbed("error", `I'm already used on ${guild.me!.voice.channel!.toString()}`, true)]
        //         });
        //         setTimeout(() => msg.delete().catch(() => null), 5000);
        //         return undefined;
        //     }
        //     if (data.dj_only && data.dj_role) {
        //         const djRole = guild.roles.resolve(data.dj_role);
        //         if (djRole && !member.roles.cache.has(djRole.id)) {
        //             const msg = await message.channel.send({
        //                 embeds: [createEmbed("error", `Sorry, but my commands are restricted only for those who has ${djRole.name} role`, true)]
        //             });
        //             setTimeout(() => msg.delete().catch(() => null), 5000);
        //             return undefined;
        //         }
        //     }
        //     this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} ${user.tag} [${user.id}] executed "${messageReaction.emoji.name!.toString()}" on ${guild.name} [${guild.id}]`);
        //     messageReaction.message.author = user;
        //     const context = new CommandContext(messageReaction.message as Message);
        //     const action = emojis.find(x => x.emoji === messageReaction.emoji.name!.toString());
        //     if (!action) return;
        //     if (action.command === "resumepause") {
        //         await music.player.pause(!music.player.paused);
        //         return music.updatePlayerEmbed();
        //     } else if (action.command === "loop") {
        //         const loopModes = {
        //             [LoopType.ONE]: "track",
        //             [LoopType.ALL]: "queue",
        //             [LoopType.NONE]: "off"
        //         };
        //         context.args = [loopModes[(music.loopType + 1) as 0|1|2] || loopModes[LoopType.NONE]];
        //         return this.client.commands.get("loop")!.execute(context);
        //     }
        //     return this.client.commands.get(action.command)!.execute(context);
        // }
    }
}
