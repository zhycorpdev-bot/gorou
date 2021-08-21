# Gorou
> Open-source music bot with lavalink. Made with Typescript. Featured with awesome new thing on Discord

<a href="https://zhycorp.net/discord"><img src="https://img.shields.io/discord/332877090003091456?color=7289da&logo=discord&logoColor=white" alt="Discord server" /></a>
<img src="https://badgen.net/badge/icon/typescript?icon=typescript&label"></a>
<a href="https://github.com/zhycorp/gorou/actions?query=workflow%3A%22Lint+code+%26+compile+test%22"><img src="https://github.com/zhycorp/gorou/workflows/Lint%20code%20&%20compile%20test/badge.svg" alt="CI Status" /></a>

## Usage

**Requires [Node.js](https://nodejs.org) version v16.6.0 or above.**
**Requires [Lavalink Server](https://github.com/freyacodes/Lavalink).**

1. Install [Node.js](https://nodejs.org)
2. Delete old `.env`, rename `.env_example` to `.env` and fill out the values
3. Fill out `NODES` with your Lavalink credentials
4. Install dependencies as stated [here](https://github.com/zhycorp/disc-11#Installation) before you continue surfing
5. Run `npm run build` using Node package manager
6. Optional thing, prune dev dependencies (this is good to save disk spaces):
```sh
$ npm prune --production
```
6. Start it with `npm start`, and you're done!

## Installation

Without optional packages:
```sh
$ npm install --no-optional
```

With optional packages (recommended):
```sh
$ npm install
```
For optional packages, you need to install build tools as stated [here](https://github.com/nodejs/node-gyp#installation) and you also need to install [Git](https://git-scm.com/).

## Features
- Music commands
- Slash commands support
- Context menu support
- Button pagination support
- Docker-friendly (if you're advanced user)
