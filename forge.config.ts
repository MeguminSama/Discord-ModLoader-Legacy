import type { ForgeConfig, ForgeConfigMaker } from '@electron-forge/shared-types';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';
import { copyFileSync } from 'fs';
import path from "path";

const config: ForgeConfig = {
  packagerConfig: {
    asar: {
      unpack: 'resource.template.js,*.dll',
    },
    afterComplete: [
      (buildPath, _electronVersion, _platform, _arch, cb) => {
        for (const file of ["ModHookInjection.dll", "LibModHook.dll", "resource.template.js"]) {
          copyFileSync(path.resolve(file), `${buildPath}/${file}`);
        }
        cb();
      }
    ],
    icon: 'src/favicon.ico',
    name: 'Discord ModLoader',
    executableName: 'DiscordModLoader',
  },
  rebuildConfig: {},
  makers: [
    new MakerZIP({}) as unknown as ForgeConfigMaker
  ],
  plugins: [
    new (AutoUnpackNativesPlugin as any)({}),
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: './src/index.html',
            js: './src/renderer.tsx',
            name: 'main_window',
            preload: {
              js: './src/preload.ts',
            },
          },
        ],
      },
    }),
  ],
};

export default config;
