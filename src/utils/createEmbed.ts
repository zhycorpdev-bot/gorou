import { ColorResolvable, MessageEmbed } from "discord.js";

type hexColorsType = "info" | "warn" | "error" | "success";
const hexColors: Record<hexColorsType, ColorResolvable> = {
    info: "#d9ab59",
    warn: "YELLOW",
    success: "#8ed959",
    error: "#d46250"
};

export function createEmbed(type: hexColorsType, message?: string, emoji = false): MessageEmbed {
    const embed = new MessageEmbed()
        .setColor(hexColors[type]);

    if (message) embed.setDescription(message);
    if (type === "error" && emoji) embed.setDescription(`<a:no:873438755086802964> **|** ${message!}`);
    if (type === "success" && emoji) embed.setDescription(`<a:yes:873438754847723531> **|** ${message!}`);
    return embed;
}
