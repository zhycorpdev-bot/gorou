import "./Node";
import { Guild } from "discord.js";

Reflect.defineProperty(Guild.prototype, "music", {
    get() {
        // @ts-expect-error-next-line
        return this.client._music.fetch(this.id);
    }
});
