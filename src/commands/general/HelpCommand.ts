import { BaseCommand } from "../../structures/BaseCommand";
import { MessageEmbed, Message, CommandInteraction, MessageActionRow, MessageSelectMenu, SelectMenuInteraction, MessageSelectOptionData } from "discord.js";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["commands", "cmds", "info"],
    description: "Shows the help menu or help for specific command.",
    name: "help",
    slash: {
        options: [
            {
                type: "STRING",
                name: "command",
                description: "Command name to view specific info about command"
            }
        ]
    },
    usage: "{prefix}help [command]"
})
export class HelpCommand extends BaseCommand {
    private readonly listEmbed = new MessageEmbed()
        .setTitle("Help Menu")
        .setColor("#00FF00")
        .setFooter(`${this.client.config.prefix}help <command> to get more info on a specific command!`, "https://hzmi.xyz/assets/images/390511462361202688.png");

    private readonly infoEmbed = new MessageEmbed()
        .setThumbnail("https://hzmi.xyz/assets/images/question_mark.png")
        .setColor("#00FF00");

    public async execute(message: Message, args: string[]): Promise<any> {
        this.infoEmbed.fields = [];
        const command = this.client.commands.get(args[0]) ?? this.client.commands.get(this.client.commands.aliases.get(args[0])!);
        if (!args.length) {
            const embed = this.listEmbed
                .setThumbnail(message.client.user?.displayAvatarURL() as string)
                .setTimestamp();
            this.listEmbed.fields = [];
            for (const category of [...this.client.commands.categories.values()]) {
                const isDev = this.client.config.devs.includes(message.author.id);
                const cmds = category.cmds.filter(c => isDev ? true : !c.meta.devOnly).map(c => `\`${c.meta.name}\``);
                if (cmds.length === 0) continue;
                if (category.hide && !isDev) continue;
                embed.addField(`**${category.name}**`, cmds.join(", "));
            }
            return message.channel.send({ embeds: [embed] }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        }
        if (!command) {
            const matching = this.generateSelectMenu(args[0], message.author.id);
            if (!matching.length) {
                return message.channel.send({
                    embeds: [
                        createEmbed("error", "Couldn't find matching command", true)
                    ]
                });
            }
            return message.channel.send({
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setMinValues(1)
                                .setMaxValues(1)
                                .setCustomId(Buffer.from(`${message.author.id}_${this.meta.name}`).toString("base64"))
                                .addOptions(matching)
                                .setPlaceholder("Select matching command")
                        )
                ],
                content: `Couldn't find matching command name. Do you mean this?`
            });
        }
        return message.channel.send({
            embeds: [
                this.infoEmbed
                    .setTitle(`Help for ${command.meta.name} command`).addField("Name", `\`${command.meta.name}\``, true)
                    .addField("Description", `\`${command.meta.description!}\``, true)
                    .addField("Aliases", Number(command.meta.aliases?.length) > 0 ? command.meta.aliases?.map(c => `\`${c}\``).join(", ") as string : "None.")
                    .addField("Usage", `\`${command.meta.usage!.replace(/{prefix}/g, this.client.config.prefix)}\``, true)
                    .setFooter(`<> = required | [] = optional ${command.meta.devOnly ? "(Only my developers can use this command)" : ""}`, "https://hzmi.xyz/assets/images/390511462361202688.png")
                    .setTimestamp()
            ]
        });
    }

    public async executeInteraction(interaction: CommandInteraction|SelectMenuInteraction, res: string[]): Promise<any> {
        this.infoEmbed.fields = [];
        const val = (Array.isArray(res) ? res[0] : null) ?? (interaction as CommandInteraction).options.getString("command");
        const cmd = this.client.commands.get(val!) ?? this.client.commands.get(this.client.commands.aliases.get(val!)!);
        if (!val) {
            const embed = this.listEmbed
                .setThumbnail(this.client.user?.displayAvatarURL() as string)
                .setTimestamp();
            this.listEmbed.fields = [];
            for (const category of [...this.client.commands.categories.values()]) {
                const isDev = this.client.config.devs.includes(interaction.user.id);
                const cmds = category.cmds.filter(c => isDev ? true : !c.meta.devOnly).map(c => `\`${c.meta.name}\``);
                if (cmds.length === 0) continue;
                if (category.hide && !isDev) continue;
                embed.addField(`**${category.name}**`, cmds.join(", "));
            }
            return interaction.reply({ embeds: [embed] });
        }
        if (!cmd) {
            const matching = this.generateSelectMenu(val, interaction.user.id);
            if (!matching.length) {
                return interaction.reply({
                    ephemeral: true,
                    embeds: [
                        createEmbed("error", "Couldn't find matching command", true)
                    ]
                });
            }
            return interaction.reply({
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setMinValues(1)
                                .setMaxValues(1)
                                .setCustomId(Buffer.from(`${interaction.user.id}_${this.meta.name}`).toString("base64"))
                                .addOptions(matching)
                                .setPlaceholder("Select matching command")
                        )
                ],
                content: `Couldn't find matching command name. Do you mean this?`
            });
        }
        await interaction.deferReply();
        if (interaction.isSelectMenu()) {
            const channel = await interaction.channel;
            const msg = await channel!.messages.fetch(interaction.message.id).catch(() => undefined);
            if (msg !== undefined) {
                const selection = msg.components[0].components.find(x => x.type === "SELECT_MENU");
                selection!.setDisabled(true);
                await msg.edit({ components: [new MessageActionRow().addComponents(selection!)] });
            }
        }
        return interaction.editReply({
            components: [],
            embeds: [
                this.infoEmbed
                    .setTitle(`Help for ${cmd.meta.name} command`)
                    .addField("Name", `\`${cmd.meta.name}\``, true)
                    .addField("Description", `\`${cmd.meta.description!}\``, true)
                    .addField("Aliases", Number(cmd.meta.aliases?.length) > 0 ? cmd.meta.aliases?.map(c => `\`${c}\``).join(", ") as string : "None.")
                    .addField("Usage", `\`${cmd.meta.usage!.replace(/{prefix}/g, this.client.config.prefix)}\``, true)
                    .setFooter(`<> = required | [] = optional ${cmd.meta.devOnly ? "(Only my developers can use this command)" : ""}`, "https://hzmi.xyz/assets/images/390511462361202688.png")
                    .setTimestamp()
            ]
        });
    }

    private generateSelectMenu(cmd: string, author: string): MessageSelectOptionData[] {
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
        const matching = [...this.client.commands.values()].filter(x => {
            const isDev = this.client.config.devs.includes(author);
            if (isDev) return x.meta.name.includes(cmd);
            return x.meta.name.includes(cmd) && !x.meta.devOnly;
        }).slice(0, 10).map((x, i) => (
            {
                label: x.meta.name,
                emoji: emojis[i],
                description: x.meta.description!.length > 47 ? `${x.meta.description!.substr(0, 47)}...` : x.meta.description!,
                value: x.meta.name
            }
        ));
        return matching;
    }
}
