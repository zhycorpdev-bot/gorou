/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Interaction } from "discord.js";
import { BaseListener } from "../structures/BaseListener";
import { CommandContext } from "../structures/CommandContext";
import { createEmbed } from "../utils/createEmbed";
import { DefineListener } from "../utils/decorators/DefineListener";

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
    }

    private decode(string: string): string {
        return Buffer.from(string, "base64").toString("ascii");
    }
}
