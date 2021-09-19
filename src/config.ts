import { ClientOptions, ClientPresenceStatus, Collection, Intents, UserResolvable } from "discord.js";

export const defaultPrefix = ".";
export const devs: UserResolvable[] = ["725331428962992131", "740075062190669884", "736943755344609301"];
export const clientOptions: ClientOptions = {
    allowedMentions: { parse: ["users"] },
    intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES],
    makeCache: () => new Collection(),
    restTimeOffset: 300,
    retryLimit: 3
};
export const devGuild = JSON.parse(process.env.DEV_GUILD! || "[]");
export const isProd = process.env.NODE_ENV === "production";
export const isDev = !isProd;
export const prefix = isDev ? ">" : defaultPrefix;
export const presenceData = {
    activities: [
        "Hello, World!",
        "Watching {textChannels.size} of text channels in {guilds.size}",
        "Listening to {users.size} of users",
        "Hello there! I am {username}",
        `My default prefix is ${prefix}`
    ],
    status: ["online"] as ClientPresenceStatus[],
    interval: 60000
};
export const shardsCount: number | "auto" = "auto";
export const nodes = JSON.parse(process.env.NODES! || "[]");
export const deleteQueueTimeout = 180000;
export const registerDevSlash = process.env.REGISTER_DEV_SLASH === "yes";
export const leftTimeout = 120000;
export const defaultBanner = process.env.DEFAULT_BANNER!;

if (typeof defaultBanner !== "string") throw new Error("config#defaultBanner must be a string.");
