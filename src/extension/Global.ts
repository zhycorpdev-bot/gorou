import { Util } from "discord.js";

globalThis.String.prototype.toProperCase = function toProperCase() {
    return this.replace(/([^\W_]+[^\s-]*) */g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

globalThis.String.prototype.escapeMarkdown = function escapeMarkdown() {
    return Util.escapeMarkdown(this.toString());
};
