import { Snowflake } from "discord-api-types";
import { FindOneOptions, getMongoRepository, MongoRepository } from "typeorm";
import { GuildSetting } from "../entities/Guild";
import { BotClient } from "../structures/BotClient";

export class GuildSettingManager {
    public repository!: MongoRepository<GuildSetting>;
    public constructor(public readonly client: BotClient) {}

    public async _init(): Promise<any> {
        this.repository = getMongoRepository(GuildSetting);
        for (const guild of [...this.client.guilds.cache.values()]) {
            const data = await this.get(guild.id);
            const channel = guild.channels.cache.get(data.requesterChannel!);
            if (channel?.isText()) {
                const message = await channel.messages.fetch(data.requesterMessage!).catch(() => null);
                if (message) {
                    guild.music.playerMessage = message;
                } else {
                    data.requesterMessage = null;
                    data.requesterChannel = null;
                    await this.repository.save(data);
                }
            }
        }
    }

    public async get(guild: Snowflake, options?: FindOneOptions<GuildSetting>): Promise<GuildSetting> {
        const data = await this.repository.findOne({ guild, ...options }) ?? this.repository.create({ guild });
        await this.repository.save(data);
        return data;
    }
}
