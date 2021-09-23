/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ButtonInteraction, Collection, CommandInteraction, CommandInteractionOptionResolver, ContextMenuInteraction, GuildMember, Interaction, InteractionReplyOptions, Message, MessageMentions, MessageOptions, MessagePayload, SelectMenuInteraction, TextBasedChannels, User } from "discord.js";
import { MessageInteractionAction } from "../typings";
import { InteractionTypes, MessageComponentTypes } from "../typings/enum";


export class CommandContext {
    public additionalArgs: Collection<string, any> = new Collection();
    public channel: TextBasedChannels|null = this.context.channel;
    public guild = this.context.guild;
    public constructor(public readonly context: Interaction|CommandInteraction|SelectMenuInteraction|ContextMenuInteraction|Message, public args: string[] = []) {}

    public setAdditionalArgs(key: string, value: any): CommandContext {
        this.additionalArgs.set(key, value);
        return this;
    }

    public async deferReply(ephemeral = false): Promise<void> {
        if (this.isInteraction()) {
            return (this.context as CommandInteraction).deferReply({ ephemeral });
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
        return this.context.channel!.send(options);
    }


    public get deferred(): boolean {
        return this.context instanceof Interaction ? (this.context as CommandInteraction).deferred : false;
    }

    public get options(): CommandInteractionOptionResolver|null {
        return this.context instanceof Interaction ? (this.context as CommandInteraction).options : null;
    }

    public get author(): User {
        return this.context instanceof Interaction ? this.context.user : this.context.author;
    }

    public get member(): GuildMember|null {
        return this.guild!.members.resolve(this.author.id);
    }

    public get mentions(): MessageMentions|null {
        return this.context instanceof Interaction ? null : this.context.mentions;
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
