/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ButtonInteraction, Collection, CommandInteraction, CommandInteractionOptionResolver, ContextMenuInteraction, Interaction, InteractionReplyOptions, Message, MessageOptions, MessagePayload, SelectMenuInteraction, TextBasedChannels, User } from "discord.js";
import { InteractionTypes, MessageComponentTypes } from "discord.js/typings/enums";
import { MessageInteractionAction } from "../typings";


export class CommandContext {
    public additionalArgs: Collection<string, any> = new Collection();
    public constructor(public readonly context: Interaction|CommandInteraction|SelectMenuInteraction|ContextMenuInteraction|Message, public args: string[] = []) {}

    public async deferReply(): Promise<void> {
        if (this.isInteraction()) {
            return (this.context as CommandInteraction).deferReply();
        }
        return Promise.resolve(undefined);
    }

    public async send(options: string|MessagePayload|MessageOptions|InteractionReplyOptions, type: MessageInteractionAction = "editReply"): Promise<Message> {
        if (this.isInteraction()) {
            (options as InteractionReplyOptions).fetchReply = true;
            const msg = await (this.context as CommandInteraction)[type](options) as Message;
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

    public isInteraction(): boolean {
        return this.isCommand() || this.isContextMenu() || this.isMessageComponent() || this.isButton() || this.isSelectMenu();
    }

    public isCommand(): boolean {
        return InteractionTypes[(this.context as Interaction).type] === InteractionTypes.APPLICATION_COMMAND && typeof (this.context as any).targetId === "undefined";
    }

    public isContextMenu(): boolean {
        return InteractionTypes[(this.context as Interaction).type] === InteractionTypes.APPLICATION_COMMAND && typeof (this.context as any).targetId !== "undefined";
    }

    public isMessageComponent(): boolean {
        return InteractionTypes[(this.context as Interaction).type] === InteractionTypes.MESSAGE_COMPONENT;
    }

    public isButton(): boolean {
        return (
            InteractionTypes[(this.context as Interaction).type] === InteractionTypes.MESSAGE_COMPONENT &&
            MessageComponentTypes[(this.context as ButtonInteraction).componentType] === MessageComponentTypes.BUTTON
        );
    }

    public isSelectMenu(): boolean {
        return (
            InteractionTypes[(this.context as Interaction).type] === InteractionTypes.MESSAGE_COMPONENT &&
            MessageComponentTypes[(this.context as SelectMenuInteraction).componentType] === MessageComponentTypes.SELECT_MENU
        );
    }
}
