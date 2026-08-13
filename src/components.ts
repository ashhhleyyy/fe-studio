import { addServer, queryServers, removeServer, ServerListEntry } from "./servers";
import { html } from "htm/preact";
import { useEffect, useState } from "preact/hooks";

import offlineIcon from "./assets/offline.svg";
import onlineIcon from "./assets/online.svg";
import bapsLogo from "./assets/baps3.png";

export function MainView(props: { serverSelected: (server: ServerListEntry) => void }) {
  const [entries, setEntries] = useState<ServerListEntry[]>([]);

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  function updateServers() {
    setLoading(true);
    queryServers().then((entries) => {
      setEntries(entries);
      setLoading(false);
    });
  }

  async function addServerCallback() {
    const urlStr = prompt('Enter server base URL (eg. https://localhost:13500');
    if (!urlStr) return;
    try {
      const url = new URL(urlStr);
      await addServer({
        protocol: url.protocol.substring(0, url.protocol.length - 1),
        host: url.hostname,
        port: parseInt(url.port),
      });
      updateServers();
    } catch {
      alert("Invalid URL!");
    }
  }

  useEffect(() => {
    updateServers();
  }, []);

  return html`
    <div class="container" style="max-width: 720px">
      <div class="mt-5">
        <div class="header text-center">
          <img class="logo img-fluid mb-4" src="${bapsLogo}" />
          <h1 class="h1 text-light">BAPS3 Presenter</h1>
        </div>
        <div id="app-container" class="card o-hidden border-0 shadow-lg my-3">
          <div class="card-body p-0">
            <div class="pt-3">
              <div class="text-center">
                <h2 class="h3 text-gray-900">Server Select</h2>
              </div>
              <hr />
            </div>
            <div class="px-3 pb-4">
              <div id="serverList" class="list-group text-left">
                ${loading && html`
                  <div class="d-flex justify-content-center">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Loading...</span>
                    </div>
                  </div>
                  `}
                ${!loading && html`<${ServerListing} entries=${entries} serverSelected=${props.serverSelected} onDelete=${editMode ? async (entry: ServerListEntry) => {
                  await removeServer(entry);
                  updateServers();
                } : undefined} />`}
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <div class="btn-group" role="group" aria-label="Settings">
              <button onclick=${() => setEditMode((m) => !m)} class="btn ${editMode ? "btn-primary" : "btn-outline-primary"}">${editMode ? "Done" : "Edit"}</button>
              ${editMode && html`<button onclick=${addServerCallback} class="btn btn-outline-success">Add server</button>`}
            </div>
          </footer>
        </div>
      </div>
    </div>
  `;
}

export function ServerListing(props: { entries: ServerListEntry[]; serverSelected: (server: ServerListEntry) => void; onDelete?: (server: ServerListEntry) => void }) {
  return html`<div class="list-group text-left">${props.entries.map((entry) => html`<${ServerListingEntry} onSelected=${() => props.serverSelected(entry)} entry=${entry} onDelete=${props.onDelete} />`)}</div>`;
}

function ServerListingEntry({ entry, onSelected, onDelete }: { entry: ServerListEntry; onSelected: () => void; onDelete?: (server: ServerListEntry) => void }) {
  return html`<a class="list-group-item list-group-item-action ${entry.primary && "active"}" onclick=${!onDelete && onSelected}>
    <div class="d-flex w-100 justify-content-between align-items-center">
      <h5 class="mb-0">
        <img class="me-1" src="${entry.online ? onlineIcon : offlineIcon}" width="16" height="16" />
        ${entry.name}
      </h5>
      <span>
        <small>${entry.config.host}:${entry.config.port}</small>
      </span>
    </div>

    <div class="d-flex w-100 justify-content-between align-items-center">
      ${entry.online ? "Connected!" : "Offline"}

      ${onDelete && html`<button type="button" class="btn btn-danger btn-sm" onclick=${() => onDelete(entry)}>Remove</button>`}
    </div>
  </a>`;
}
