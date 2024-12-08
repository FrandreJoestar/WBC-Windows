const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  connectToServer: (address, port, authKey) => {
    ipcRenderer.send('connect-to-server', { address, port, authKey });
  },
  disconnectFromServer: () => {
    ipcRenderer.send('disconnect-from-server');
  },
  sendMessage: (message) => {
    ipcRenderer.send('send-message', message);
  },
  onConnectionStatus: (callback) => {
    ipcRenderer.on('connection-status', (event, status) => callback(status));
  },
  onReceiveMessage: (callback) => {
    ipcRenderer.on('receive-message', (event, message) => callback(message));
  },
  getServers: () => {
    ipcRenderer.send('get-servers');
  },
  onServerList: (callback) => {
    ipcRenderer.on('server-list', (event, servers) => callback(servers));
  },
  deleteServer: (address, port, authKey) => {
    return new Promise((resolve, reject) => {
      ipcRenderer.once('server-deleted', (event, response) => {
        resolve(response);
      });
      ipcRenderer.send('delete-server', {  address, port, authKey  });
    });
  },
});
