import { html, render } from "htm/preact";
import { MainView } from "./components";
import { useState } from 'preact/hooks';
import { makeServerUrl, ServerListEntry } from "./servers";

function App() {
  const [activeServer, setActiveServer] = useState<ServerListEntry | null>(null);

  if (activeServer) {
    return html`<iframe class="presenterview" src=${makeServerUrl(activeServer.config, '/presenter/')} />`
  } else {
    return html`<${MainView} serverSelected=${(server: ServerListEntry) => {
      if (!server.online && !confirm("This server appears to be offline, are you sure you want to connect?")) {
        return;
      }
      setActiveServer(server);
    }} />`;
  }
}

render(html`<${App} />`, document.body);
