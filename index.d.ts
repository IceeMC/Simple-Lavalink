declare module "simple-lavalink" {

    import { EventEmitter } from "events";
    import * as WebSocket from "ws";
    import {
        Client,
        User
    } from "discord.js";

    export class AudioManager extends Map<string, AudioPlayer> {
        public constructor(client: Client, nodes: Array<NodeObject>, shards: number);

        // Properties
        public client: Client;
        public nodes: Map<string, AudioNode>;
        public _nodes: Array<NodeObject>;

        // Methods
        public join(data: JoinData): AudioPlayer;
        public getTracks(search: string, host: string): Promise<TrackResult | null>;
        public addNode(node: NodeObject): AudioNode;
        public removeNode(host: string): boolean;
        public leave(id: string): boolean;
    }

    export class AudioPlayer extends EventEmitter {
        public constructor(data: any, node: AudioNode, manager: AudioManager);

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
        
        // Events
        public on(event: string, cb: Function);
        public on(event: "end", cb: (event: AudioPlayerEndEvent) => void): this;
        public on(event: "stuck", cb: (event: AudioPlayerStuckEvent) => void): this;
        public on(event: "error", cb: (event: AudioPlayerExceptionEvent) => void): this;
        public on(event: "unknown", cb: (event: AudioPlayerUnknownEvent) => void): this;

        public once(event: string, cb: Function);
        public once(event: "end", cb: (event: AudioPlayerEndEvent) => void): this;
        public once(event: "stuck", cb: (event: AudioPlayerStuckEvent) => void): this;
        public once(event: "error", cb: (event: AudioPlayerExceptionEvent) => void): this;
        public once(event: "unknown", cb: (event: AudioPlayerUnknownEvent) => void): this;
    }

    export class AudioNode extends EventEmitter {
        public constructor(manager: AudioManager);

        // Properties
        public ready: boolean;
        public stats: AudioNodeStats;
        public ws: WebSocket;
        public manager: AudioManager;
        public nodeObj: NodeObject;

        // Methods
        public sendToWS(object: any): this;

        // Events
        public on(event: string, cb: Function): this;
        public on(event: "ready", cb: () => void): this;
        public on(event: "message", cb: (message: any) => void): this;
        public on(event: "close", cb: (reason: string) => void): this;
        public on(event: "error", cb: (error: Error) => void): this;

        public once(event: string, cb: Function): this;
        public once(event: "ready", cb: () => void): this;
        public once(event: "message", cb: (message: any) => void): this;
        public once(event: "close", cb: (reason: string) => void): this;
        public once(event: "error", cb: (error: Error) => void): this;
    }

    export class AudioTrack {
        public constructor(data: AudioTrackData);

        // Properties
        public data: AudioTrackData;
        public track: string;
        public identifier: string;
        public isSeekable: boolean;
        public author: string;
        public length: string;
        public isStream: boolean;
        public title: string;
        public uri: string;

        public toString(): string;
        public toJSON(): AudioTrackJSON;
    }

    // Misc Types
    type NodeObject = {
        host: string,
        password: string,
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

    type TrackResult = {
        name?: string,
        tracks: Array<string>
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