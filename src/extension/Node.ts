/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Player, Structure, Track, TrackEndEvent } from "erela.js";

Structure.extend("Node", Node => class extends Node {
    protected trackEnd(player: Player, track: Track|null, payload: TrackEndEvent): void {
        if (["LOAD_FAILED", "CLEAN_UP"].includes(payload.reason)) {
            player.queue.previous = player.queue.current;
            player.queue.current = player.queue.shift()!;

            if (!player.queue.current) return this.queueEnd(player, track!, payload);

            this.manager.emit("trackEnd", player, track, payload);
            if (this.manager.options.autoPlay) void player.play();
            return;
        }

        // If a track was forcibly played
        if (payload.reason === "REPLACED") {
            this.manager.emit("trackEnd", player, track, payload);
            return;
        }

        // If a track ended and is track repeating
        if (track && player.trackRepeat) {
            player.queue.previous = player.queue.current;
            player.queue.current = track;

            this.manager.emit("trackEnd", player, track, payload);
            if (this.manager.options.autoPlay) void player.play();
            return;
        }

        // If a track ended and is track repeating
        if (track && player.queueRepeat) {
            player.queue.add(track);
            player.queue.previous = player.queue.current;
            player.queue.current = player.queue.shift()!;
            this.manager.emit("trackEnd", player, track, payload);
            if (this.manager.options.autoPlay) void player.play();
            return;
        }

        // If there is another song in the queue
        if (player.queue.length) {
            player.queue.previous = player.queue.current;
            player.queue.current = player.queue.shift()!;

            this.manager.emit("trackEnd", player, track, payload);
            if (this.manager.options.autoPlay) void player.play();
            return;
        }

        // If there are no songs in the queue
        if (!player.queue.length) return this.queueEnd(player, track!, payload);
    }
});
