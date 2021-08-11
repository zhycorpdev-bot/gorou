import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { chunk } from "../../utils/chunk";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { ButtonPagination } from "../../utils/ButtonPagination";
import { CommandInteraction, Message, MessageEmbed } from "discord.js";

@DefineCommand({
    aliases: ["q"],
    cooldown: 3,
    description: "List of queued songs",
    name: "queue",
    slash: {
        options: []
    },
    usage: "{prefix}queue"
})
export class QueueCommand extends BaseCommand {
    public async execute(message: Message): Promise<any> {
        const { music } = message.guild!;
        const queue = music.player?.queue ?? [];
        const pages = chunk(queue.map((x, i) => `**${++i}.** **[${x.title}](${x.uri!})** <@${String(x.requester)}>`), 10).map(x => x.join("\n"));
        const embed = createEmbed("info", pages[0] || "Empty, add some by using `play` command", false)
            .setAuthor(`${message.guild!.name} Queue`, message.guild!.iconURL({ dynamic: true, size: 4096 })!);
        if (pages.length) embed.setFooter(`Page 1 of ${pages.length}.`);
        if (pages.length > 1) {
            const pagination = new ButtonPagination(message, {
                content: music.player?.queue.current ? `▶ **Now** playing: **${music.player.queue.current.title}](${music.player.queue.current.uri!})**` : "",
                pages, embed,
                edit: (i, emb, page): MessageEmbed => emb.setDescription(page).setFooter(`Page ${i + 1} of ${pages.length}`)
            });
            await pagination.start();
        }
    }

    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        const { music } = interaction.guild!;
        const queue = music.player?.queue ?? [];
        const pages = chunk(queue.map((x, i) => `**${++i}.** **[${x.title}](${x.uri!})** <@${String(x.requester)}>`), 10).map(x => x.join("\n"));
        const embed = createEmbed("info", pages[0] || "Empty, add some by using `play` command", false)
            .setAuthor(`${interaction.guild!.name} Queue`, interaction.guild!.iconURL({ dynamic: true, size: 4096 })!);
        if (pages.length) embed.setFooter(`Page 1 of ${pages.length}.`);
        if (pages.length > 1) {
            const pagination = new ButtonPagination(interaction, {
                content: music.player?.queue.current ? `▶ **Now** playing: **${music.player.queue.current.title}](${music.player.queue.current.uri!})**` : "",
                pages, embed,
                edit: (i, emb, page): MessageEmbed => emb.setDescription(page).setFooter(`Page ${i + 1} of ${pages.length}`)
            });
            await pagination.start();
        }
    }
}
