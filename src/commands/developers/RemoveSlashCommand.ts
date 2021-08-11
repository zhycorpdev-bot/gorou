import { Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    cooldown: 0,
    description: "Delete slash command from current app",
    devOnly: true,
    name: "removeslash",
    usage: "{prefix}removeslash [name]"
})
export class RemoveSlashCommand extends BaseCommand {
    public async execute(message: Message, args: string[]): Promise<any> {
        const all = await this.client.application!.commands.fetch();
        let guildCount = 0;
        for (const guild of [...this.client.guilds.cache.values()]) {
            const target = guild.commands.cache.find(x => x.name.toLowerCase() === args[0].toLowerCase());
            if (target) {
                await guild.commands.delete(target.id);
                guildCount++;
            }
        }
        const target = all.find(x => x.name.toLowerCase() === args[0].toLowerCase());
        if (args[0] === "all") {
            all.forEach(x => this.client.application!.commands.delete(x.id));
            return message.channel.send({
                embeds: [
                    createEmbed("success", "Remove all slash commands", true)
                ]
            });
        }
        if (target) await this.client.application!.commands.delete(target.id);
        return message.channel.send({
            embeds: [
                createEmbed("success", `Removed \`${args[0]}\` slash command from global ${guildCount ? `and from ${guildCount} guild${guildCount > 1 ? "s" : ""}` : ""}`, true)
            ]
        });
    }
}
