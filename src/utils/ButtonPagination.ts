import { Message, MessageButton, MessageActionRow, InteractionButtonOptions, CommandInteraction, TextChannel, SelectMenuInteraction, ContextMenuInteraction, Interaction } from "discord.js";
import { PaginationPayload } from "../typings";

const DATAS: InteractionButtonOptions[] = [
    {
        style: "SECONDARY",
        label: "Previous 10 pages",
        emoji: "⏪",
        customId: "PREV10"
    },
    {
        style: "PRIMARY",
        label: "Previous",
        emoji: "⬅️",
        customId: "PREV"
    },
    {
        style: "DANGER",
        label: "Stop",
        emoji: "🚫",
        customId: "STOP"
    },
    {
        style: "PRIMARY",
        label: "Next",
        emoji: "➡️",
        customId: "NEXT"
    },
    {
        style: "SECONDARY",
        label: "Next 10 pages",
        emoji: "⏩",
        customId: "NEXT10"
    }
];

export class ButtonPagination {
    public constructor(public readonly msg: Interaction|CommandInteraction|SelectMenuInteraction|ContextMenuInteraction|Message, public readonly payload: PaginationPayload) {}

    public async start(): Promise<any> {
        const embed = this.payload.embed;
        const pages = this.payload.pages;
        let index = 0;

        this.payload.edit.call(this, index, embed, pages[index]);
        const isInteraction = this.msg instanceof CommandInteraction;
        const buttons = DATAS.map(d => new MessageButton(d));
        const toSend = {
            content: this.payload.content,
            embeds: [embed],
            components: pages.length < 2
                ? []
                : [
                    new MessageActionRow()
                        .addComponents(buttons)
                ]
        };
        let msg = await (isInteraction ? (this.msg as CommandInteraction).editReply(toSend) : this.msg.channel!.send(toSend));
        msg = await (this.msg.client.channels.cache.get(this.msg.channelId!) as TextChannel).messages.fetch(msg.id);
        if (pages.length < 2) return;
        const author = isInteraction ? (this.msg as CommandInteraction).user : (this.msg as Message).author;
        const collector = msg.createMessageComponentCollector({
            filter: i => {
                void i.deferUpdate();
                return DATAS.map(x => x.customId).includes(i.customId) && i.user.id === author.id;
            }
        });

        collector.on("collect", async i => {
            if (i.customId === "PREV10") {
                index -= 10;
            } else if (i.customId === "PREV") {
                index--;
            } else if (i.customId === "NEXT") {
                index++;
            } else if (i.customId === "NEXT10") {
                index += 10;
            } else {
                await (msg as Message).delete();
                return;
            }

            index = ((index % pages.length) + Number(pages.length)) % pages.length;

            this.payload.edit.call(this, index, embed, pages[index]);
            await (msg as Message).edit({
                embeds: [embed],
                content: this.payload.content,
                components: pages.length < 2
                    ? []
                    : [
                        new MessageActionRow()
                            .addComponents(buttons)
                    ]
            });
        });
    }
}
