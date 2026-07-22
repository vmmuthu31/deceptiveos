import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getServerUrl: () => ipcRenderer.invoke('get-server-url'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  onServerStatus: (callback: (status: 'online' | 'offline') => void) => {
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${await ipcRenderer.invoke('get-server-url')}/health`);
        callback(response.ok ? 'online' : 'offline');
      } catch {
        callback('offline');
      }
    };

    checkStatus();
    intervalId = setInterval(checkStatus, 5000);

    return () => clearInterval(intervalId);
  },
});

contextBridge.exposeInMainWorld('ciphernestAPI', {
  fetch: (path: string, options: RequestInit = {}) => {
    return ipcRenderer.invoke('get-server-url').then((baseUrl: string) => {
      return fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      }).then((res) => res.json());
    });
  },
});
