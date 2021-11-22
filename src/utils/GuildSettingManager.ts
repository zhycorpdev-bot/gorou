import { Snowflake } from "discord-api-types";
import { TextChannel } from "discord.js";
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
            if (!data.requesterChannel) continue;
            await guild.channels.fetch().catch(() => undefined);
            const channel = guild.channels.cache.get(data.requesterChannel);
            if (channel?.isText()) {
                const message = await channel.messages.fetch(data.requesterMessage!).catch(() => null);
                if (message) {
                    this.client.logger.info(`Fetched ${(message.channel as TextChannel).name} [${message.channelId}] on ${message.guild!.name}`);
                    // const cached = message.reactions.cache.filter(x => this.client.config.emojis.includes(x.emoji.name!));
                    // if (cached.size !== this.client.config.emojis.length) {
                    //     for (const e of this.client.config.emojis) await message.react(e);
                    // }
                    guild.music.playerMessage = message.id;
                    guild.music.playerChannel = message.channelId;
                } else {
                    this.client.logger.info(`Failed to fetch ${data.requesterChannel} on ${guild.name}`);
                    data.requesterMessage = null;
                    data.requesterChannel = null;
                    await this.repository.save(data);
                }
            }
        }
    }

    public async get(guild: Snowflake, options?: FindOneOptions<GuildSetting>): Promise<GuildSetting> {
        let data = await this.repository.findOne({ guild, ...options });
        if (!data) {
            data = this.repository.create();
            data.guild = guild;
            await this.repository.save(data);
        }
        return data;
    }
}
