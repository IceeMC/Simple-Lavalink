const { EventEmitter } = require("events");

class AudioPlayer extends EventEmitter {

    /**
     * Creates a new audio player.
     * @param {Object} data - The data from the connectToVoice method.
     * @param {AudioNode} node - The AudioNode used.
     * @param {AudioManager} manager - The AudioManager used.
     */
    constructor(data, node, manager) {
        /**
         * Create the EventEmitter.
         */
        super();

        /**
         * An object returned from the joinVoice method.
         */
        Object.defineProperty(this, "data", { value: data, writable: false });

        /**
         * The AudioNode instance.
         * @type {AudioNode}
         */
        Object.defineProperty(this, "node", { value: node, writable: false });

        /**
         * The AudioManager that was used.
         * @type {AudioManager}
         */
        Object.defineProperty(this, "manager", { value: manager, writable: false });

        /**
         * The current state of the AudioPlayer.
         */
        this.playerState = {
            currentVolume: 100,
            currentTrack: null,
            currentTimestamp: null,
            currentPosition: 0
        };

        /**
         * Whether or not the player is playing or not.
         */
        this.playing = false;

        /**
         * The id of the guild
         * @type {String}
         */
        this.guildId = data.guild;

        /**
         * The queue the of the player.
         * @type {Array}
         */
        this.queue = [];

        /**
         * Wether the player is on loop or not.
         * @type {Boolean}
         */
        this.looping = false;
    }

    /**
     * Plays a song.
     * @param {string} track The Base64 track.
     * @returns {this}
     */
    play(track) {
        this.node.sendToWS({
            op: "play",
            guildId: this.guildId,
            track: track
        });
        this.playing = true;
        this.playerState.currentTrack = track;
        this.playerState.currentTimestamp = Date.now();
        return this;
    }

    /**
     * Stops the current player.
     * @returns {this}
     */
    stop() {
        this.node.sendToWS({
            op: "stop",
            guildId: this.guildId
        });
        return this;
    }

    /**
     * Pauses the current player.
     * @returns {this}
     */
    pause() {
        this.node.sendToWS({
            op: "pause",
            guildId: this.guildId,
            pause: true
        });
        this.playing = false;
        return this;
    }

    /**
     * Resumes the current player.
     * @returns {this}
     */
    resume() {
        this.node.sendToWS({
            op: "pause",
            guildId: this.guildId,
            pause: false
        });
        this.playing = true;
        return this;
    }

    /**
     * Changes the players volume
     * @param {number} volume The new volume
     */
    setVolume(volume) {
        if (typeof volume !== "number") throw new Error("setVolume expects a number");
        this.node.sendToWS({
            op: "volume",
            guildId: this.guildId,
            volume: volume
        });
        this.playerState.currentVolume = volume;
        return this;
    }

    /**
     * Sets the players looping property to the passed boolean
     * @param {boolean} bool The boolean
     */
    setLooping(bool) {
        if (typeof bool !== "boolean") throw new Error("setLooping expects a boolean");
        this.looping = bool;
        return this;
    }

    /**
     * Seeks to the any part of the song in ms.
     * @param {number} ms The position to seek too.
     * @returns {this}
     */
    seek(ms) {
        this.node.sendToWS({
            op: "seek",
            guildId: this.guildId,
            position: ms
        });
        return this;
    }

    /**
     * Provides a voice update to the guild.
     * @param {Object} data - The data Object from the VOICE_STATE_UPDATE event.
     */
    _update(data) {
        const { me } = this.manager.client.guilds.get(this.guildId);
        const sessionId = me.voice ? me.voice.sessionId : me.voiceState.session_id;
        this.node.sendToWS({
            op: "voiceUpdate",
            guildId: this.guildId,
            sessionId,
            event: data.d
        });
    }

}

module.exports = AudioPlayer;
