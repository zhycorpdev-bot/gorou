/* eslint-disable @typescript-eslint/no-base-to-string */
import { GuildChannel, MessageActionRow, MessageButton } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";

@DefineCommand({
    aliases: [],
    description: "Setup the unique song request channel",
    name: "setup",
    slash: {
        options: [
            {
                name: "channel",
                description: "Song request channel",
                type: "CHANNEL",
                required: false
            }
        ]
    },
    usage: "{prefix}setup [#channel]"
})
export class SetupCommand extends BaseCommand {
    public async execute(ctx: CommandContext): Promise<any> {
        if (!ctx.deferred && ctx.isInteraction()) await ctx.deferReply();
        if (!ctx.member?.permissions.has("MANAGE_GUILD")) {
            return ctx.send({
                embeds: [createEmbed("error", "You need `MANAGE_GUILD` permission to do this!")]
            });
        }
        const channel = ctx.mentions?.channels.first() ?? ctx.guild?.channels.cache.get(ctx.args[0]) ?? ctx.options?.getChannel("channel") as GuildChannel|null;
        if (!channel?.isText()) {
            return ctx.send({
                embeds: [createEmbed("error", "Please mention a valid **text-channel**")]
            });
        }
        const data = await this.client.databases.guilds.get(ctx.guild!.id);
        const old = ctx.guild?.channels.cache.get(data.requesterChannel!);
        if (old) {
            return ctx.send({
                embeds: [createEmbed("error", `Already setup in ${old.toString()}`)]
            });
        }
        if (!channel.permissionsFor(this.client.user!.id)?.has(["SEND_MESSAGES", "ATTACH_FILES"])) {
            return ctx.send({
                embeds: [createEmbed("error", "I need these permissions to make requester channel: `SEND_MESSAGES`, `ATTACH_FILES`")]
            });
        }
        if (channel.isText()) {
            data.requesterChannel = channel.id;
            const msg = await channel.send({
                embeds: [
                    createEmbed("info")
                        .setAuthor("No song playing currently", ctx.guild!.iconURL({ dynamic: true, size: 4096 })!)
                        .setImage(this.client.config.defaultBanner)
                        .setDescription("Join a voice channel and queue songs by name or url in here.")
                        .setFooter(`Prefix for this server is: ${data.prefix}`)
                ],
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId(this.encode(`player_resumepause`))
                                .setEmoji("⏯")
                                .setStyle("SECONDARY"),
                            new MessageButton()
                                .setCustomId(this.encode(`player_stop`))
                                .setEmoji("⏹")
                                .setStyle("DANGER"),
                            new MessageButton()
                                .setCustomId(this.encode(`player_skip`))
                                .setEmoji("⏭")
                                .setStyle("SECONDARY"),
                            new MessageButton()
                                .setCustomId(this.encode(`player_loop`))
                                .setEmoji("🔁")
                                .setStyle("SECONDARY"),
                            new MessageButton()
                                .setCustomId(this.encode(`player_shuffle`))
                                .setEmoji("🔀")
                                .setStyle("SUCCESS")
                        )
                ]
            });
            ctx.guild!.music.playerMessage = msg;
            data.requesterMessage = msg.id;
        }
        await this.client.databases.guilds.repository.save(data);
        return ctx.send({
            embeds: [createEmbed("info", `Set requester channel to: <#${data.requesterChannel!}>`)]
        });
    }

    public encode(string: string): string {
        return Buffer.from(string).toString("base64");
    }
}
