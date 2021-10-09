import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { BaseCommand } from "../../structures/BaseCommand";
import { createEmbed } from "../../utils/createEmbed";
import { version } from "discord.js";
import { uptime as osUptime } from "os";
import { CommandContext } from "../../structures/CommandContext";
import { formatMS } from "../../utils/formatMS";

@DefineCommand({
    aliases: ["botinfo", "info", "information", "stats"],
    description: "Show the bot's information",
    name: "about",
    slash: {},
    usage: "{prefix}about"
})
export class AboutCommand extends BaseCommand {
    public async execute(ctx: CommandContext): Promise<void> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply(ctx.channel!.id === ctx.guild!.music.playerChannel);
        if (ctx.channel!.id === ctx.guild!.music.playerChannel) {
            await ctx.send({
                embeds: [createEmbed("error", "You can't use this command here")],
                ephemeral: true
            });
            return undefined;
        }
        ctx.send({
            embeds: [
                createEmbed("info", `
\`\`\`asciidoc
Cached users count  :: ${await this.client.util.getUsersCount()}
Channels count      :: ${await this.client.util.getChannelsCount()}
Guilds count        :: ${await this.client.util.getGuildsCount()}
Shards count        :: ${this.client.shard ? `${this.client.shard.count}` : "N/A"}
Shard ID            :: ${this.client.shard ? `${this.client.shard.ids[0]}` : "N/A"}
Playing Music on    :: ${await this.client.util.getTotalPlaying()} guilds
Platform - Arch     :: ${process.platform} - ${process.arch}
OS Uptime           :: ${formatMS(osUptime() * 1000)}
Memory (RSS)        :: ${this.client.util.bytesToSize(process.memoryUsage().rss)} 
Memory (Heap Total) :: ${this.client.util.bytesToSize(process.memoryUsage().heapTotal)}
Memory (Heap Used)  :: ${this.client.util.bytesToSize(process.memoryUsage().heapUsed)}
Process Uptime      :: ${formatMS(process.uptime() * 1000)}
Bot Uptime          :: ${formatMS(this.client.uptime!)}
Node.js version     :: ${process.version}
Discord.js version  :: v${version}
Bot version         :: v${(await this.client.util.getPackageJSON()).version}
Source code         :: https://github.com/zhycorp/gorou
\`\`\`
            `).setAuthor(`${this.client.user?.username as string} - Bot Information`)
            ]
        }).catch(e => this.client.logger.error("ABOUT_CMD_ERR:", e));
    }
}
