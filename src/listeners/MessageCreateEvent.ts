import { MessageEmbed, User, Message } from "discord.js";
import { DefineListener } from "../utils/decorators/DefineListener";
import { BaseListener } from "../structures/BaseListener";
import { CommandContext } from "../structures/CommandContext";

@DefineListener("messageCreate")
export class MessageCreateEvent extends BaseListener {
    public async execute(message: Message): Promise<any> {
        if (message.channel.type === "DM" || !this.client.commands.isReady) return message;
        const data = await this.client.databases.guilds.get(message.guild!.id);
        if (message.channelId === message.guild!.music.playerChannel) {
            if (message.deletable && message.author.id !== this.client.user!.id) await message.delete().catch(() => null);
            if ((!message.content.startsWith(data.prefix) && !message.content.startsWith(this.client.config.prefix)) && !message.author.bot) {
                this.client.logger.info(`${message.author.tag} [${message.author.id}] is using play command on ${message.guild!.name}`);
                void this.client.commands.get("play")!.execute(new CommandContext(message, message.content.split(/ +/g)).setAdditionalArgs("fromRequesterChannel", true));
            }
        }
        if (message.author.bot) return;
        if (message.content.startsWith(data.prefix) || message.content.startsWith(this.client.config.prefix)) void this.client.commands.handle(message, message.content.startsWith(this.client.config.prefix) ? this.client.config.prefix : data.prefix);

        if ((await this.getUserFromMention(message.content))?.id === this.client.user?.id && message.channelId !== message.guild!.music.playerChannel) {
            message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setAuthor(this.client.user!.username, this.client.user?.displayAvatarURL())
                        .setColor("#00FF00")
                        .setDescription(`:wave: | Hello ${message.author.username}, my prefix for this server is \`${data.prefix}\``)
                        .setTimestamp()
                ]
            }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        }
    }

    private getUserFromMention(mention: string): Promise<User | undefined> {
        const matches = /^<@!?(\d+)>$/.exec(mention);
        if (!matches) return Promise.resolve(undefined);

        const id = matches[1];
        return this.client.users.fetch(id);
    }
}
