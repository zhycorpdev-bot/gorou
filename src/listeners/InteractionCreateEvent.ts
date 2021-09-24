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
                this.client.logger.info(`${interaction.user.tag} [${interaction.user.id}] is using ${cmd.meta.name} context chat command from ${cmd.meta.category!} category`);
                context.additionalArgs.set("message", interaction.options.getMessage("message"));
                void cmd.execute(context);
            }
        }
        if (interaction.isCommand()) {
            const cmd = this.client.commands.filter(x => x.meta.slash !== undefined).find(x => x.meta.slash!.name === interaction.commandName);
            if (cmd) {
                this.client.logger.info(`${interaction.user.tag} [${interaction.user.id}] is using ${cmd.meta.name} interaction command from ${cmd.meta.category!} category`);
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
                const action: "resumepause"|"stop"|"skip"|"loop"|"shuffle" = src.split("_")[1] as any;
                const { music } = interaction.guild!;
                if (!music.player) {
                    await interaction.deferReply({ ephemeral: true });
                    const msg = await interaction.followUp({
                        ephemeral: true,
                        embeds: [createEmbed("error", "I'm not playing anything right now", true)]
                    });
                    setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                    return undefined;
                }
                const member = interaction.guild!.members.cache.get(interaction.user.id);
                const vc = interaction.guild!.channels.cache.get(member!.voice.channelId!) as VoiceChannel|undefined;
                if (!vc) {
                    await interaction.deferReply({ ephemeral: true });
                    const msg = await interaction.followUp({
                        ephemeral: true,
                        embeds: [createEmbed("error", "Please join a voice channel", true)]
                    });
                    setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                    return undefined;
                }
                if (!vc.permissionsFor(interaction.guild!.me!)!.has(["CONNECT", "SPEAK"])) {
                    await interaction.deferReply({ ephemeral: true });
                    const msg = await interaction.followUp({
                        ephemeral: true,
                        embeds: [createEmbed("error", "I'm missing `CONNECT` or `SPEAK` permission in your voice!", true)]
                    });
                    setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                    return undefined;
                }
                if (!vc.joinable) {
                    await interaction.deferReply({ ephemeral: true });
                    const msg = await interaction.followUp({
                        ephemeral: true,
                        embeds: [createEmbed("error", "I can't join your voice channel", true)]
                    });
                    setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                    return undefined;
                }
                if (interaction.guild!.me!.voice.channelId && interaction.guild!.me!.voice.channelId !== member!.voice.channelId) {
                    await interaction.deferReply({ ephemeral: true });
                    const msg = await interaction.followUp({
                        ephemeral: true,
                        embeds: [createEmbed("error", `I'm already used on ${interaction.guild!.me!.voice.channel!.toString()}`, true)]
                    });
                    setTimeout(() => this.client.util.convertToMessage(msg).delete().catch(() => null), 5000);
                    return undefined;
                }
                this.client.logger.info(`${this.client.shard ? `[Shard #${this.client.shard.ids[0]}]` : ""} ${interaction.user.tag} [${interaction.user.id}] executed "${action}" on ${interaction.guild!.name} [${interaction.guildId}]`);
                if (action === "resumepause") {
                    await music.player.pause(!music.player.paused);
                    await interaction.deferUpdate();
                    await music.updatePlayerEmbed();
                } else if (action === "loop") {
                    await interaction.deferReply({ ephemeral: true });
                    const loopModes = {
                        [LoopType.ONE]: "track",
                        [LoopType.ALL]: "queue",
                        [LoopType.NONE]: "off"
                    };
                    context.args = [loopModes[(music.loopType + 1) as 0|1|2] || loopModes[LoopType.NONE]];
                    void this.client.commands.get("loop")!.execute(context);
                } else if (action === "stop") {
                    await music.player!.destroy();
                    await music.reset();
                    await interaction.deferUpdate();
                } else {
                    await interaction.deferReply({ ephemeral: true });
                    const cmd = this.client.commands.find(x => x.meta.name === action);
                    if (cmd) void cmd.execute(context);
                }
            }
        }
    }

    private decode(string: string): string {
        return Buffer.from(string, "base64").toString("ascii");
    }
}
