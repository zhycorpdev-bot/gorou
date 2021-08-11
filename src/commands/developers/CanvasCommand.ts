/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseCommand } from "../../structures/BaseCommand";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { Message, MessageEmbed, MessageAttachment } from "discord.js";
import { resolveImage } from "canvas-constructor/skia";

@DefineCommand({
    aliases: ["cv"],
    description: "Test a canvas-contructor code",
    devOnly: true,
    name: "canvas",
    usage: "{prefix}canvas <code>"
})
export class CanvasCommand extends BaseCommand {
    public async execute(message: Message, args: string[]): Promise<any> {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { Canvas } = require("canvas-constructor/skia");
        const ping = Date.now();
        const regex = /https?:\/\/.+\.(?:png|jpg|jpeg)/gi;
        if (!args.length) return message.channel.send("No code provided");

        const embed = new MessageEmbed();
        let input = `\`\`\`js\n${args.join(" ")}\`\`\``;
        if (input.length > 1204) {
            input = await this.hastebin(args.join(" "));
        }

        embed.addField("📥 INPUT", input);

        try {
            const bg = await resolveImage(await (this.client.request.get(
                "https://media.discordapp.net/attachments/861054769716002836/861926975281954826/images_61.jpeg"
            ).buffer()));
            const avatar = await resolveImage(await (this.client.request.get(message.author.displayAvatarURL({ format: "png" })).buffer()));
            let code = args.join(" ");
            if (!code.startsWith("new Canvas")) throw new Error("the command cannot execute without new Canvas(high, width)");
            if (!code.includes(".toBuffer()")) code += ".toBuffer()";

            code.replace(/;/g, "");
            // @ts-expect-error-next-line
            code.replace(regex, async x => {
                const result = await resolveImage((await this.client.request.get(x)).body);
                return result;
            });
            // eslint-disable-next-line no-eval
            const evaled = await eval(code);
            embed.setColor("#00FF12")
                .addField("📤 OUTPUT", "\u200B")
                .setImage("attachment://canvas.png")
                .setFooter(`⏱️ ${Date.now() - ping}ms`);
            return message.channel.send({ embeds: [embed], files: [new MessageAttachment(evaled, "canvas.png")] });
        } catch (e) {
            let err = `\`\`\`ini\n${e.message}\`\`\``;
            if (err.length > 1204) err = await this.hastebin(e.message);

            embed.setColor("#FF1200")
                .addField("⛔ ERROR", err)
                .setFooter(`⏱️ ${Date.now() - ping}ms`);
            return message.channel.send({ embeds: [embed] });
        }
    }

    private async hastebin(text: string): Promise<string> {
        return this.client.request.post("https://bin.hzmi.xyz/documents", {
            body: text
        }).json<{ key: string }>().then(res => `https://bin.hzmi.xyz/${res.key}`);
    }
}
