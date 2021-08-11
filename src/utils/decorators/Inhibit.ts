/* eslint-disable func-names, @typescript-eslint/naming-convention */
import { CommandInteraction, Message } from "discord.js";
import { createEmbed } from "../createEmbed";

export function inhibit<T extends (msg: Message, ...args: any[]) => Promise<string|void> | (string|void)>(func: T) {
    return function (_: unknown, __: string, descriptor: PropertyDescriptor): void {
        const method = descriptor.value;
        if (!method) throw new Error("Descriptor value isn't provided");
        descriptor.value = async function (msg: Message, ...args: any[]): Promise<any> {
            const message = await func(msg, ...args);
            if (typeof message === "string") {
                if (message.length) {
                    return msg.channel.send({
                        embeds: [createEmbed("error", message, true)]
                    });
                }
            }
            await method.call(this, msg, ...args);
        };
    };
}

export function inhibitInteraction<T extends (interaction: CommandInteraction, ...args: any[]) => Promise<string|void> | (string|void)>(func: T) {
    return function (_: unknown, __: string, descriptor: PropertyDescriptor): void {
        const method = descriptor.value;
        if (!method) throw new Error("Descriptor value isn't provided");
        descriptor.value = async function (interaction: CommandInteraction, ...args: any[]): Promise<any> {
            const message = await func(interaction, ...args);
            if (typeof message === "string") {
                if (message.length) {
                    return interaction.reply({
                        embeds: [createEmbed("error", message, true)]
                    });
                }
            }
            await method.call(this, interaction, ...args);
        };
    };
}
