import { load } from "@tauri-apps/plugin-store";

export interface ServerConfig {
    protocol: string;
    host: string;
    port: number;
}

export interface ServerListEntry {
    config: ServerConfig;
    online: boolean;
    name: string;
    primary: boolean;
}

const store = await load('store.json', {
    autoSave: true,
    defaults: {
        servers: [
            {
                protocol: 'http',
                host: 'localhost',
                port: 13500,
            },
        ],
    }
});

export function makeServerUrl(server: ServerConfig, endpoint: string): string {
    return `${server.protocol}://${server.host}:${server.port}${endpoint}`;
}

async function queryServer(server: ServerConfig, primary: boolean): Promise<ServerListEntry> {
    try {
        const resp = await fetch(makeServerUrl(server, '/status-json'));
        if (!resp.ok) {
            throw new Error('request error');
        }
        const data = await resp.json();
        return {
            config: server,
            name: data.server.server_name,
            online: true,
            primary,
        };
    } catch {
        return {
            config: server,
            name: '- Offline -',
            online: false,
            primary,
        };
    }
}

export async function queryServers(): Promise<ServerListEntry[]> {
    const servers = await store.get<ServerConfig[]>('servers');
    return Promise.all(servers!.map((server) => queryServer(server, false)));
}

async function updateServers(op: (servers: ServerConfig[]) => ServerConfig[]) {
    const servers = await store.get<ServerConfig[]>('servers');
    await store.set('servers', op(servers!));
}

export async function addServer(config: ServerConfig) {
    await updateServers(servers => [...servers, config]);
}

export async function removeServer(entry: ServerListEntry) {
    console.log('removing server', entry);
    await updateServers(servers => servers.filter(server => server.protocol !== entry.config.protocol || server.host !== entry.config.host || server.port !== entry.config.port));
}
