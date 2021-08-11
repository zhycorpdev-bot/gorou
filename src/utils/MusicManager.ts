import { Collection } from "discord.js";
import { BotClient } from "../structures/BotClient";
import { MusicHandler } from "./MusicHandler";

export class MusicManager {
    public readonly cache: Collection<string, MusicHandler> = new Collection();
    public constructor(private readonly client: BotClient) {}

    public fetch(id: string): MusicHandler {
        if (!this.cache.get(id)) this.cache.set(id, new MusicHandler(this.client.guilds.cache.get(id)!));
        return this.cache.get(id)!;
    }
}
