import { Message, MessageEmbed, Collection, ClientEvents, CommandInteraction, Guild as EGuild, ApplicationCommandData, SelectMenuInteraction, ApplicationCommandOptionData } from "discord.js";
import { BotClient } from "../structures/BotClient";
import { MusicHandler } from "../utils/MusicHandler";

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
    execute(message: Message, args: string[], ...args: any): any;
    executeInteraction(interaction: CommandInteraction|SelectMenuInteraction, ...args: any): any;
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
