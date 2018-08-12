declare module "simple-lavalink" {

    import { EventEmitter } from "events";
    import * as WebSocket from "ws";
    import {
        Client,
        User
    } from "discord.js";

    export class AudioManager extends Map<string, AudioPlayer> {
        public constructor(client: Client, nodes: Array<NodeObject>, shards: number): this;

        // Properties
        public client: Client;
        public nodes: Map<string, AudioNode>;
        private _nodes: Array<NodeObject>;

        // Methods
        private _launch(): void;
        public join(data: JoinData): AudioPlayer;
        public leave(id: string): boolean;
        private _returnPlayer(data: any, node: AudioNode): AudioPlayer;
    }

    export class AudioPlayer extends EventEmitter {
        public constructor(data: any, node: AudioNode, manager: AudioManager): this;

        // Properties
        public data: any;
        public node: AudioNode;
        public manager: AudioManager;
        public playerState: PlayerState;
        public playing: boolean;
        public guildId: string;
        public queue: Array<AudioTrack>;
        public looping: boolean;

        // Methods
        public play(track: string): this;
        public stop(): this;
        public pause(): this;
        public resume(): this;
        public setVolume(volume: number): this;
        public setLooping(value: boolean): this;
        public seek(ms: number): this;
        private _update(data: VoiceServerUpdateData): void;
        
        // Events
        public on(event: string, listener: Function);
        public on(event: "end", listener: (event: AudioPlayerEndEvent) => void): this;
        public on(event: "stuck", listener: (event: AudioPlayerStuckEvent) => void): this;
        public on(event: "error", listener: (event: AudioPlayerExceptionEvent) => void): this;
        public on(event: "unknown", listener: (event: AudioPlayerUnknownEvent) => void): this;

        public once(event: string, listener: Function);
        public once(event: "end", listener: (event: AudioPlayerEndEvent) => void): this;
        public once(event: "stuck", listener: (event: AudioPlayerStuckEvent) => void): this;
        public once(event: "error", listener: (event: AudioPlayerExceptionEvent) => void): this;
        public once(event: "unknown", listener: (event: AudioPlayerUnknownEvent) => void): this;
    }

    export class AudioNode extends EventEmitter {
        public constructor(manager: AudioManager): this;

        // Properties
        public ready: boolean;
        public stats: AudioNodeStats;
        public ws: WebSocket;
        public manager: AudioManager;
        public nodeObj: NodeObject;

        // Methods
        private _nodeHeaders(node: AudioNode): AudioNodeHeaders;
        private _create(NodeObj: NodeObject): void;
        private _ready(obj: NodeObject): void;
        private _message(msg: any): void;
        private _close(code: number, reason: null | string): void;
        private _error(error: Error): void;
        public sendToWS(object: any): this;

        // Events
        public on(event: string, listener: Function): this;
        public on(event: "ready", listener: () => void): this;
        public on(event: "message", listener: (message: any) => void): this;
        public on(event: "close", listener: (reason: string) => void): this;
        public on(event: "error", listener: (error: Error) => void): this;

        public once(event: string, listener: Function): this;
        public once(event: "ready", listener: () => void): this;
        public once(event: "message", listener: (message: any) => void): this;
        public once(event: "close", listener: (reason: string) => void): this;
        public once(event: "error", listener: (error: Error) => void): this;
    }

    export class AudioTrack {
        public constructor(data: AudioTrackData, requester: User): this;

        // Properties
        public data: AudioTrackData;
        public requester: User;
        public track: string;
        public identifier: string;
        public isSeekable: boolean;
        public author: string;
        public length: string;
        public isStream: boolean;
        public title: string;
        public uri: string;

        private _timestamp(time: number): string;
        private _pad(num: number, idleLength: number): string;
        public toString(): string;
        public toJSON(): AudioTrackJSON;
    }

    // Misc Types
    type NodeObject = {
        host: string,
        port: number,
        region: string,
        restPort: number
    }

    type PlayerState = {
        currentVolume: number,
        currentTrack: string,
        currentTimestamp: number,
        currentPosition: number
    };

    type VoiceServerUpdateData = {
        guild_id: string,
        token: string,
        endpoint: string
    };

    type JoinData = {
        guild: string,
        channel: string,
        deaf?: boolean,
        mute?: boolean,
        host: string
    };

    // AudioPlayer types
    type AudioPlayerEndEvent = {
        track: string,
        reason: string
    };

    type AudioPlayerStuckEvent = {
        track: string,
        stuckAt: number
    };

    type AudioPlayerExceptionEvent = {
        track: string,
        error: string
    };

    type AudioPlayerUnknownEvent = {
        event: string
    }

    // AudioNode types
    type AudioNodeStats = {
        players: number,
        playingPlayers: number,
        uptime: number,
        memory: {
            free: number,
            used: number,
            allocated: number,
            reservable: number
        },
        cpu: {
            cores: number,
            systemLoad: number,
            lavalinkLoad: number
        },
        frameStats?: {
            sent: number,
            nulled: number,
            deficit: number
        }
    };

    type AudioNodeHeaders = {
        Authorization: string,
        "Num-Shards": number,
        "User-Id": string
    };

    // AudioTrack types
    type AudioTrackData = {
        track: string,
        info: {
            identifier: string,
            isSeekable: boolean,
            author: string,
            length: number,
            isStream: boolean,
            position: number,
            title: string,
            uri: string
        }
    };

    type AudioTrackJSON = {
        requester: {
            username: string,
            id: string,
            discriminator: string,
            tag: string
        },
        track: string,
        identifier: string,
        isSeekable: boolean,
        author: string,
        length: string,
        isStream: boolean,
        title: string,
        uri: string
    };

}