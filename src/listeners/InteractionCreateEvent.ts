/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Interaction, VoiceChannel } from "discord.js";
import { BaseListener } from "../structures/BaseListener";
import { CommandContext } from "../structures/CommandContext";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";
import { LoopType } from "../utils/MusicHandler";

@DefineListener("interactionCreate")
export class InteractionCreateEvent extends BaseListener {
    public async execute(interaction: Interaction): Promise<any> {
        if (!interaction.inGuild()) return;
        const context = new CommandContext(interaction);
        if (interaction.isContextMenu()) {
            const cmd = this.client.commands.find(x => x.meta.contextChat === interaction.commandName);
            if (cmd) {
                context.additionalArgs.set("message", interaction.options.getMessage("message"));
                void cmd.execute(context);
            }
        }
        if (interaction.isCommand()) {
            const cmd = this.client.commands.filter(x => x.meta.slash !== undefined).find(x => x.meta.slash!.name === interaction.commandName);
            if (cmd) {
                void cmd.execute(context);
            }
        }
        if (interaction.isSelectMenu()) {
            const val = this.decode(interaction.customId);
            const user = val.split("_")[0] ?? "";
            const cmd = val.split("_")[1] ?? "";
            if (interaction.user.id !== user) {
                void interaction.reply({
                    ephemeral: true,
                    embeds: [
                        createEmbed("info", `That interaction only for <@${user}>`)
                    ]
                });
            }
            if (cmd && user === interaction.user.id) {
                const command = this.client.commands.filter(x => x.meta.slash !== undefined).find(x => x.meta.name === cmd);
                if (command) {
                    context.additionalArgs.set("values", interaction.values);
                    void command.execute(context);
                }
            }
        }
        if (interaction.isButton()) {
            const src = this.decode(interaction.customId || "");
            if (src.startsWith("player")) {
                await interaction.deferReply();
                const action: "resumepause"|"stop"|"skip"|"loop"|"shuffle" = src.split("_")[1] as any;
                const { music } = interaction.guild!;
                if (!music.player) {
                    const msg = await interaction.followUp({
                        embeds: [createEmbed("error", "I'm not playing anything right now", true)]
                    });
                    return setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                }
                const member = interaction.guild!.members.cache.get(interaction.user.id);
                const vc = interaction.guild!.channels.cache.get(member!.voice.channelId!) as VoiceChannel|undefined;
                if (!vc) {
                    const msg = await interaction.followUp({
                        embeds: [createEmbed("error", "Please join a voice channel", true)]
                    });
                    return setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                }
                if (!vc.permissionsFor(interaction.guild!.me!)!.has(["CONNECT", "SPEAK"])) {
                    const msg = await interaction.followUp({
                        embeds: [createEmbed("error", "I'm missing `CONNECT` or `SPEAK` permission in your voice!", true)]
                    });
                    return setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                }
                if (!vc.joinable) {
                    const msg = await interaction.followUp({
                        embeds: [createEmbed("error", "I can't join your voice channel", true)]
                    });
                    return setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                }
                if (interaction.guild!.me!.voice.channelId && interaction.guild!.me!.voice.channelId !== member!.voice.channelId) {
                    const msg = await interaction.followUp({
                        embeds: [createEmbed("error", `I'm already used on ${interaction.guild!.me!.voice.channel!.toString()}`, true)]
                    });
                    return setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                }
                if (action === "resumepause") {
                    await music.player.pause(!music.player.paused);
                    void interaction.followUp({
                        embeds: [createEmbed("success", music.player.paused ? "Paused current music" : "Resumed current music", true)]
                    }).then(x => setTimeout(() => this.client.util.convertToMessage(x).delete().catch(() => null), 5000));
                } else if (action === "loop") {
                    const loopModes = {
                        [LoopType.ONE]: "track",
                        [LoopType.ALL]: "queue",
                        [LoopType.NONE]: "off"
                    };
                    context.args = [loopModes[(music.loopType + 1) as 0|1|2] || loopModes[LoopType.NONE]];
                    void this.client.commands.get("loop")!.execute(context);
                } else {
                    const cmd = this.client.commands.filter(x => x.meta.slash !== undefined).find(x => x.meta.slash!.name === action);
                    if (cmd) void cmd.execute(context);
                }
            }
        }
    }

    private decode(string: string): string {
        return Buffer.from(string, "base64").toString("ascii");
    }
}
