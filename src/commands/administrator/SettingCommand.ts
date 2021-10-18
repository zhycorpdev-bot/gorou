import { MessageEmbed } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";
import { getRepository } from "typeorm";
import { GuildSetting } from "../../entities/Guild";
import { CommandContext } from "../../structures/CommandContext";
import { stripIndents } from "common-tags";

type Option = "anti-duplicate" | "djonly" | "custom-dj" | "max-queue" | "default-volume" | "announcesongs";
type Action = "enable" | "disable" | "set" | "available";

const options = ["anti-duplicate", "djonly", "custom-dj", "max-queue", "default-volume", "djrole", "announcesongs"] as Option[];

@DefineCommand({
    aliases: ["setting"],
    name: "settings",
    description: "Customize my setting",
    usage: "{prefix}settings <option> <args[1]>"
})
export class SettingCommand extends BaseCommand {
    public async execute(ctx: CommandContext): Promise<any> {
        if (!ctx.member?.permissions.has("MANAGE_GUILD")) {
            return ctx.send({
                embeds: [createEmbed("error", "You need **Manage Server** permission to run this command", true)]
            });
        }
        const repository = getRepository(GuildSetting);
        const data = await repository.findOne({ guild: ctx.guild!.id });
        if (!options.includes(ctx.args[0] as Option)) {
            const embed = createEmbed("info")
                .setAuthor(`${this.client.user!.username} Settings`, this.client.user!.displayAvatarURL())
                .setDescription(`Type \`${data!.prefix}settings <option>\` to view more about an option. Available options :`)
                .addField("◀ Anti Duplicate", `\`${data!.prefix}settings anti-duplicate\``, true)
                .addField("🚫 DJ Only", `\`${data!.prefix}settings djonly\``, true)
                .addField("🎶 Custom DJ Role", `\`${data!.prefix}settings custom-dj\``, true)
                .addField("🔄 Max Queue Length", `\`${data!.prefix}settings max-queue\``, true)
                .addField("🔊 Default Volume", `\`${data!.prefix}settings default-volume\``, true)
                .setTimestamp();
            return ctx.send({ embeds: [embed] });
        }
        ctx.args[1] = ctx.args[1] ?? "";
        switch (ctx.args[0].toLowerCase()) {
            case "anti-duplicate": {
                if (!["enable", "disable"].includes(ctx.args[1].toLowerCase())) {
                    return ctx.send({
                        embeds: [
                            this.createEmbed(
                                ctx, "◀ Anti Duplicate", "Setting", data!.duplicate_song ? "Enabled" : "Disabled", stripIndents`
                                    \`${data!.prefix}settings anti-duplicate <enable || disable>\`
                                    Example: \`${data!.prefix}settings anti-duplicate enable\`
                                `, "Enable or Disable"
                            )
                        ]
                    });
                }
                data!.duplicate_song = (ctx.args[1] as Action).toLowerCase() === "enable";
                await repository.save(data!);
                return ctx.send({
                    embeds: [createEmbed("info", `${data!.duplicate_song ? "Enabled" : "Disabled"} anti duplicate track`)]
                });
            }
            case "djonly": {
                if (!["enable", "disable"].includes(ctx.args[1].toLowerCase())) {
                    return ctx.send({
                        embeds: [
                            this.createEmbed(
                                ctx, "🚫 DJ Only", "Setting", data!.dj_only ? "Enabled" : "Disabled", stripIndents`
                                    \`${data!.prefix}settings djonly <enable || disable>\`
                                    Example: \`${data!.prefix}settings djonly enable\`
                                `, "Enable or Disable"
                            )
                        ]
                    });
                }
                data!.dj_only = (ctx.args[1] as Action).toLowerCase() === "enable";
                await repository.save(data!);
                return ctx.send({
                    embeds: [
                        createEmbed("info", `${data!.dj_only ? "Enabled" : "Disabled"} dj only mode`)
                    ]
                });
            }
            case "custom-dj": {
                if (!ctx.args[1]) {
                    const djRole = ctx.guild!.roles.resolve(data!.dj_role ?? "");
                    return ctx.send({
                        embeds: [
                            this.createEmbed(
                                ctx, "🎶 Custom DJ Role", "Setting", djRole ? djRole.toString() : "None.", stripIndents`
                                \`${data!.prefix}settings custom-dj <role>\`
                                Example: \`${data!.prefix}settings custom-dj @DJ Role\`/\`${data!.prefix}settings custom-dj 652745074826964577\`
                            `, "Role tag or role id"
                            )
                        ]
                    });
                }
                // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
                const matchedRole = ctx.args[1].match(/^(?:<@&)?(([0-9]{18})|([0-9]{17}))>?$/) ?? [];
                const resolvedRole = ctx.guild!.roles.resolve(matchedRole[1]);
                if (!resolvedRole) {
                    return ctx.send({
                        embeds: [createEmbed("error", "Couldn't find that role!")]
                    });
                }
                data!.dj_role = resolvedRole.id;
                await repository.save(data!);
                return ctx.send({
                    embeds: [createEmbed("info", `Now my music commands are restricted only for those who has ${resolvedRole.toString()}`)]
                });
            }
            case "max-queue": {
                if (!ctx.args[1]) {
                    return ctx.send({
                        embeds: [
                            this.createEmbed(
                                ctx, "🔄 Max Queue Length", "Setting", `${data!.max_queue} songs`, stripIndents`
                                    \`${data!.prefix}settings max-queue <number/disable>\`
                                    Example: \`${data!.prefix}settings max-queue 20\`/\`${data!.prefix}settings max-queue disable\`
                                `, "Any number between 10 and 100 or disable"
                            )
                        ]
                    });
                }
                if (!isNaN(parseInt(ctx.args[1]))) {
                    if (parseInt(ctx.args[1]) < 10 || parseInt(ctx.args[1]) > 100) {
                        return ctx.send({
                            embeds: [createEmbed("info", "Invalid number. It should between 10 - 100")]
                        });
                    }
                    data!.max_queue = parseInt(ctx.args[1]);
                    await repository.save(data!);
                    return ctx.send({
                        embeds: [createEmbed("info", `Max queue limit set to \`${data!.max_queue}\` tracks`)]
                    });
                } else if (ctx.args[1].toLowerCase() === "disable") {
                    data!.max_queue = null as any;
                    await repository.save(data!);
                    return ctx.send({
                        embeds: [createEmbed("info", "Disabled queue limit")]
                    });
                }
                return ctx.send({
                    embeds: [createEmbed("info", "Invalid number. It should between 10 - 100")]
                });
            }
            case "default-volume": {
                if (!ctx.args[1]) {
                    return ctx.send({
                        embeds: [
                            this.createEmbed(
                                ctx, "🔊 Default Volume", "Setting", String(data!.default_volume), stripIndents`
                                    \`${data!.prefix}settings default-volume <a number/disable>\`
                                    Example: \`${data!.prefix}settings default-volume 100\`/\`${data!.prefix}settings default-volume disable\`
                                `, "Any number between 15 and 200 or disable"
                            )
                        ]
                    });
                }
                if (!isNaN(parseInt(ctx.args[1]))) {
                    if (parseInt(ctx.args[1]) < 15 || parseInt(ctx.args[1]) > 200) {
                        return ctx.send({
                            embeds: [createEmbed("info", "Invalid number. It should between 15 - 200")]
                        });
                    }
                    data!.default_volume = parseInt(ctx.args[1]);
                    await repository.save(data!);
                    return ctx.send({
                        embeds: [createEmbed("info", `🔊 **|** Set default volume to \`${data!.default_volume}\``)]
                    });
                } else if (ctx.args[1].toLowerCase() === "disable") {
                    data!.default_volume = null as any;
                    await repository.save(data!);
                    return ctx.send({
                        embeds: [createEmbed("info", "Disabled default volume")]
                    });
                }
                return ctx.send({
                    embeds: [createEmbed("info", "Invalid number. It should between 15 - 200")]
                });
            }
        }
    }

    private createEmbed(ctx: CommandContext, name: string, currentTitle: string, currentDescription: string, usage: string, validUsage: string): MessageEmbed {
        return createEmbed("info")
            .setAuthor(`${ctx.guild!.name} Setting - ${name}`, this.client.user!.displayAvatarURL())
            .setDescription("**Remind** : Hooks such as [] or <> are not to be used when using commands")
            .addField(`➡ Current ${currentTitle}`, currentDescription)
            .addField("✨ Usage", usage)
            .addField("✅ Valid Usage", validUsage);
    }
}
