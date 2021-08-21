import { Collection, CommandInteraction, CommandInteractionOptionResolver, ContextMenuInteraction, Interaction, InteractionReplyOptions, Message, MessageOptions, MessagePayload, SelectMenuInteraction, TextBasedChannels, User } from "discord.js";

export type MessageInteractionPayload = "editReply" | "reply" | "followUp";

export class CommandContext {
    public additionalArgs: Collection<string, any> = new Collection();
    public constructor(public readonly context: Interaction|CommandInteraction|SelectMenuInteraction|ContextMenuInteraction|Message, public args: string[] = []) {}

    public isInteraction(): boolean {
        return this.context instanceof Interaction;
    }

    public async send(options: string|MessagePayload|MessageOptions|InteractionReplyOptions, type: MessageInteractionPayload = "editReply"): Promise<Message> {
        if (this.context instanceof Interaction && this.context.isCommand()) {
            (options as InteractionReplyOptions).fetchReply = true;
            const msg = await this.context[type](options) as Message;
            const channel = this.context.channel;
            const res = await channel!.messages.fetch(msg.id).catch(() => null);
            return res ?? msg;
        }
        if ((options as InteractionReplyOptions).ephemeral) {
            throw new Error("Cannot send ephemeral message in a non-interaction context");
        }
        return this.context.channel!.send(options);
    }


    public get options(): CommandInteractionOptionResolver|null {
        return this.context instanceof Interaction ? (this.context as CommandInteraction).options : null;
    }

    public get channel(): TextBasedChannels|null {
        return this.context.channel;
    }

    public get author(): User {
        return this.context instanceof Interaction ? this.context.user : this.context.author;
    }
}
