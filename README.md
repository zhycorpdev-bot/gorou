# discordbot-template (LEGACY)

> This is an old version of [Hazmi35/discordbot-template](https://github.com/Hazmi35/discordbot-template) that's used in [Hazmi35/jukebox](https://github.com/Hazmi35/jukebox) (slimmed down version without category support)

## Note about dotenv files
On development, start:dev script will load current .env file, but start script does not, this template are intended to use Docker, if you need to load .env on production, please add `import "dotenv/config"` on index.ts, also on development, sharding is disabled, because it does not support ts-node.

## Note about Node version 12.x
This template supports 12.x but not with default configuration, to support node 12.x please modify the target in tsconfig.json to ES2019

## Will this template updated? like dependencies update, bug fixes, some small new features etc?
Yes, because I still use this template on some bots and [Hazmi35/discordbot-template](https://github.com/Hazmi35/discordbot-template) is not finished *yet.* so of course I'll update this template.
