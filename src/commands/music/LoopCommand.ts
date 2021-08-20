import { CommandInteraction, Message } from "discord.js";
import { BaseCommand } from "../../structures/BaseCommand";
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
    public async execute(message: Message, args: string[]): Promise<any> {
        const { music } = message.guild!;
        const loopMode = args[0]?.toLowerCase() as keyof typeof loopModes|null;
        if (loopMode) {
            if (loopMode in loopModes) {
                music.setLoop(loopModes[loopMode]);
                await message.channel.send({
                    embeds: [
                        createEmbed("info", `Loop mode set to \`${loopMode}\``, true)
                    ]
                });
            } else {
                await message.channel.send({
                    embeds: [
                        createEmbed("error", `Invalid mode \`${loopMode}\`. Valid modes are ${Object.keys(loopModes).map(x => `\`${x}\``).join(", ")}`, true)
                    ]
                });
            }
        } else {
            await message.channel.send({
                embeds: [
                    createEmbed("info", `Current loop mode is \`${Object.entries(loopModes).find(x => x[1] === music.loopType)![0]}\``, true)
                ]
            });
        }
    }

    @isMusicPlaying(true)
    @isMemberInVoiceChannel(true)
    @isMemberVoiceChannelJoinable(true, true)
    @isSameVoiceChannel(true)
    public async executeInteraction(interaction: CommandInteraction): Promise<any> {
        await interaction.deferReply();
        const { music } = interaction.guild!;
        const loopMode = interaction.options.getString("type")?.toLowerCase() as keyof typeof loopModes|null;
        if (loopMode) {
            if (loopMode in loopModes) {
                music.setLoop(loopModes[loopMode]);
                await interaction.editReply({
                    embeds: [
                        createEmbed("info", `Loop mode set to \`${loopMode}\``, true)
                    ]
                });
            } else {
                await interaction.editReply({
                    embeds: [
                        createEmbed("error", `Invalid mode \`${loopMode}\`. Valid modes are ${Object.keys(loopModes).map(x => `\`${x}\``).join(", ")}`, true)
                    ]
                });
            }
        } else {
            await interaction.editReply({
                embeds: [
                    createEmbed("info", `Current loop mode is \`${Object.entries(loopModes).find(x => x[1] === music.loopType)![0]}\``, true)
                ]
            });
        }
    }
}
