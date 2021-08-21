import { MessageEmbed, Collection, ClientEvents, Guild as EGuild, ApplicationCommandData, ApplicationCommandOptionData } from "discord.js";
import { BotClient } from "../structures/BotClient";
import { CommandContext } from "../structures/CommandContext";
import { MusicHandler } from "../utils/MusicHandler";

export type MessageInteractionAction = "editReply" | "reply" | "followUp";

export interface PaginationPayload {
    content?: string;
    pages: string[];
    embed: MessageEmbed;
    edit(index: number, embed: MessageEmbed, page: string): unknown;
}

export interface IListener {
    readonly name: keyof ClientEvents;
    execute(...args: any): void;
}

export interface SlashOption extends ApplicationCommandData {
    name?: string;
    description?: string;
    options?: ApplicationCommandOptionData[];
}

export interface ICommandComponent {
    meta: {
        aliases?: string[];
        cooldown?: number;
        disable?: boolean;
        readonly path?: string;
        devOnly?: boolean;
        description?: string;
        readonly category?: string;
        name: string;
        usage?: string;
        slash?: SlashOption;
        contextChat?: string;
    };
    execute(context: CommandContext, ...args: any): any;
}

export interface ICategoryMeta {
    name: string;
    hide: boolean;
    cmds: Collection<string, ICommandComponent>;
}

declare module "discord.js" {
    export interface Guild extends EGuild {
        client: BotClient;
        music: MusicHandler;
    }
}
