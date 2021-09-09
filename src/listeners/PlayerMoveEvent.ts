import { VoiceChannel } from "discord.js";
import { Player } from "erela.js";
import { BaseListener } from "../structures/BaseListener";
import { DefineListener } from "../utils/decorators/DefineListener";

@DefineListener("playerMove", "erela")
export class PlayerMoveEvent extends BaseListener {
    public async execute(player: Player, oldCh: string, newCh: string): Promise<any> {
        const newVC = this.client.channels.cache.get(newCh) as VoiceChannel|null;
        const newVCMembers = newVC?.members.filter(m => !m.user.bot);
        const music = this.client._music.fetch(player.guild);
        if (newVCMembers?.size === 0 && !music.timeout) this.client.util.doTimeout([...newVCMembers.values()], music);
        else if (newVCMembers?.size !== 0 && music.timeout) this.client.util.resumeTimeout([...newVCMembers!.values()], music);
        player.setVoiceChannel(newCh);
    }
}
