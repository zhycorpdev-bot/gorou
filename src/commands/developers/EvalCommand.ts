/* eslint-disable @typescript-eslint/no-unused-vars, no-eval */
import { BaseCommand } from "../../structures/BaseCommand";
import { MessageEmbed } from "discord.js";
import { request } from "https";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { CommandContext } from "../../structures/CommandContext";

@DefineCommand({
    aliases: ["ev", "js-exec", "e", "evaluate"],
    cooldown: 0,
    description: "Only the bot owner can use this command.",
    devOnly: true,
    name: "eval",
    usage: "{prefix}eval <some js code>"
})
export class EvalCommand extends BaseCommand {
    public async execute(ctx: CommandContext): Promise<any> {
        const msg = ctx.context;
        const message = ctx.context;
        const client = this.client;

        const embed = new MessageEmbed()
            .setColor("#00FF00")
            .addField("Input", `\`\`\`js\n${ctx.args.join(" ")}\`\`\``);

        try {
            let code = ctx.args.slice(0).join(" ");
            if (!code) return ctx.send("No js code was provided");
            let evaled;
            if (code.includes("--silent") && code.includes("--async")) {
                code = code.replace("--async", "").replace("--silent", "");
                await eval(`(async () => {
                            ${code}
                        })()`);
                return;
            } else if (code.includes("--async")) {
                code = code.replace("--async", "");
                evaled = await eval(`(async () => {
                            ${code}
                        })()`);
            } else if (code.includes("--silent")) {
                code = code.replace("--silent", "");
                await eval(code);
                return;
            } else {
                evaled = await eval(code);
            }
            if (typeof evaled !== "string") {
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                evaled = require("util").inspect(evaled, {
                    depth: 0
                });
            }

            const output = this.clean(evaled);
            if (output.length > 1024) {
                const hastebin = await this.hastebin(output);
                embed.addField("Output", `${hastebin}.js`);
            } else { embed.addField("Output", `\`\`\`js\n${output}\`\`\``); }
            ctx.send({ embeds: [embed] }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        } catch (e) {
            const error = this.clean(e);
            if (error.length > 1024) {
                const hastebin = await this.hastebin(error);
                embed.addField("Error", `${hastebin}.js`);
            } else { embed.setColor("#FF0000").addField("Error", `\`\`\`js\n${error}\`\`\``); }
            ctx.send({ embeds: [embed] }).catch(e => this.client.logger.error("PROMISE_ERR:", e));
        }
    }

    private clean(text: string): string {
        if (typeof text === "string") {
            return text
                .replace(new RegExp(process.env.DISCORD_TOKEN!, "g"), "[REDACTED]")
                .replace(/`/g, `\`${String.fromCharCode(8203)}`)
                .replace(/@/g, `@${String.fromCharCode(8203)}`);
        }
        return text;
    }

    private hastebin(text: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const req = request({ hostname: "bin.hzmi.xyz", path: "/documents", method: "POST", minVersion: "TLSv1.3" }, res => {
                let raw = "";
                res.on("data", chunk => raw += chunk);
                res.on("end", () => {
                    if (res.statusCode! >= 200 && res.statusCode! < 300) return resolve(`https://bin.hzmi.xyz/${JSON.parse(raw).key}`);
                    return reject(
                        new Error(`[hastebin] Error while trying to send data to https://bin.hzmi.xyz/documents,` +
                        `${res.statusCode?.toString() as string} ${res.statusMessage?.toString() as string}`)
                    );
                });
            }).on("error", reject);
            req.write(typeof text === "object" ? JSON.stringify(text, null, 2) : text);
            req.end();
        });
    }
}
