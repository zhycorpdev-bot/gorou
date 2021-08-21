import { BaseCommand } from "../../structures/BaseCommand";
import { CommandContext } from "../../structures/CommandContext";
import { createEmbed } from "../../utils/createEmbed";
import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { isMemberInVoiceChannel, isMemberVoiceChannelJoinable, isMusicPlaying, isSameVoiceChannel } from "../../utils/decorators/MusicHelpers";
import { LoopType } from "../../utils/MusicHandler";

const loopModes = {
    track: LoopType.ONE,
    queue: LoopType.ALL,
    off: LoopType.NONE
};

@DefineCommand({
    aliases: ["repeat"],
    cooldown: 3,
    description: "Check current or change loop mode",
    name: "loop",
    slash: {
        options: [
            {
                choices: [
                    {
                        name: "Disable Loop",
                        value: "off"
                    },
                    {
                        name: "Loop Current Queue",
                        value: "queue"
                    },
                    {
                        name: "Loop Current Track",
                        value: "track"
                    }
                ],
                description: "Which one should i repeat?",
                name: "type",
                required: false,
                type: "STRING"
            }
        ]
    },
    usage: "{prefix}loop [track|queue|off]"
})
export class LoopCommand extends BaseCommand {
    @isMusicPlaying()
    @isMemberInVoiceChannel()
    @isMemberVoiceChannelJoinable()
    @isSameVoiceChannel()
    public async execute(ctx: CommandContext): Promise<any> {
        if (ctx.isInteraction() && !ctx.deferred) await ctx.deferReply();
        const { music } = ctx.guild!;
        const loopMode = (ctx.args[0]?.toLowerCase() || ctx.options?.getString("type")) as keyof typeof loopModes|null;
        if (loopMode) {
            if (loopMode in loopModes) {
                music.setLoop(loopModes[loopMode]);
                await ctx.send({
                    embeds: [
                        createEmbed("info", `Loop mode set to \`${loopMode}\``, true)
                    ]
                }, "editReply");
            } else {
                await ctx.send({
                    embeds: [
                        createEmbed("error", `Invalid mode \`${loopMode}\`. Valid modes are ${Object.keys(loopModes).map(x => `\`${x}\``).join(", ")}`, true)
                    ]
                }, "editReply");
            }
        } else {
            await ctx.send({
                embeds: [
                    createEmbed("info", `Current loop mode is \`${Object.entries(loopModes).find(x => x[1] === music.loopType)![0]}\`. To change loop mode, use this: \`${this.client.config.prefix}loop [track|queue|off]\``, true)
                ]
            }, "editReply");
        }
    }
}
