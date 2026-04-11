/// <reference types="node" />
import type { CapacitorConfig } from '@capacitor/cli';

const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'app.lovable.cebf9c14158a47ef9e317ef91766047a',
  appName: 'Nail Studio',
  webDir: 'dist',
  ...(serverUrl 
  ?{
      server: {
      url: serverUrl,
      cleartext: serverUrl.startsWith('http://'),
    },
  }
  : {}),
};

export default config;
