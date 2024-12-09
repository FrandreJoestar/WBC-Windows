const { app, BrowserWindow, ipcMain } = require('electron');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

let mainWindow;
let ws;
const serverListPath = path.join('servers.json');

// Function to load saved server list from the file
function loadServerList() {
  try {
    const data = fs.readFileSync(serverListPath);
    return JSON.parse(data);
  } catch (err) {
    return []; // Return an empty array if no saved servers
  }
}

// Function to save the server list to a file
function saveServerList(servers) {
  fs.writeFileSync(serverListPath, JSON.stringify(servers, null, 2));
}

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: `${__dirname}/preload.js`,
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
      frame: false
    },
  });

  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);
  // Handle window closed event
  mainWindow.on('closed', () => {
    mainWindow = null;
    if (ws) ws.close();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle connect-to-server event
ipcMain.on('connect-to-server', (event, { address, port, authKey }) => {
  const serverUrl = `ws://${address}:${port}`;
  ws = new WebSocket(serverUrl, {
    headers: { 'X-Auth-Key': authKey },
  });

  ws.on('open', () => {
    event.reply('connection-status', { status: 'connected' });

    // Save server info if connection is successful
    const servers = loadServerList();
    const existingServerIndex = servers.findIndex(s => s.address === address && s.port === port);
    if (existingServerIndex === -1) {
      servers.push({ address, port, authKey });
      saveServerList(servers); // Save to file
    }
  });

  ws.on('message', (message) => {
    event.reply('receive-message', message.toString());
  });

  ws.on('close', () => {
    event.reply('connection-status', { status: 'disconnected' });
  });

  ws.on('error', (err) => {
    event.reply('connection-status', { status: 'error', error: err.message });
  });
});

// Handle send-message event
ipcMain.on('send-message', (event, message) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    event.reply('connection-status', { status: 'not connected' });
  }
});

// Handle disconnect-from-server event
ipcMain.on('disconnect-from-server', (event) => {
  if (ws) {
    ws.close();
    ws = null;
    event.reply('connection-status', { status: 'disconnected' });
  }
});

// Handle fetching the list of saved servers
ipcMain.on('get-servers', (event) => {
  const servers = loadServerList();
  event.reply('server-list', servers); // Send the server list to the renderer
});

// Handle delete-server event
ipcMain.on('delete-server', (event, {  address, port, authKey  }) => {
  const servers = loadServerList(); // 加载当前服务器列表

  // 过滤掉需要删除的服务器
  const updatedServers = servers.filter(
    (server) => !(server.address === address && server.port === port)
  );

  // 检查是否有服务器被删除
  if (servers.length !== updatedServers.length) {
    saveServerList(updatedServers); // 保存更新后的列表
    event.reply('server-deleted', { success: true });
  } else {
    event.reply('server-deleted', { success: false, error: 'Server not found' });
  }
});
