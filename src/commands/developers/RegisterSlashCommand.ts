import { ApplicationCommandData, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    cooldown: 0,
    description: "Register slash command from current app to current guild",
    devOnly: true,
    name: "registerslash",
    usage: "{prefix}registerslash"
})
export class RegisterSlashCommand extends BaseCommand {
    public async execute(message: Message): Promise<any> {
        const all = await this.client.commands.filter(x => x.meta.slash !== undefined);
        let count = 0;
        for (const cmd of [...all.values()]) {
            await message.guild!.commands.create(cmd.meta.slash as ApplicationCommandData).then(() => count++).catch();
        }
        return message.channel.send({
            embeds: [
                createEmbed("success", `Registered \`${count}\`/\`${all.size}\` commands to **${message.guild!.name}** from commands folder`)
            ]
        });
    }
}
