import type {PluginLoadOptions, PluginLoadResult, PluginOptimizeOptions, PluginRunOptions, PluginTransformOptions, PluginTransformResult, SnowpackConfig, SnowpackPlugin} from 'snowpack';
import Handlebars from "handlebars";
import fs from 'fs-extra';
import path from 'path';
import { pascalCase } from "pascal-case";
import slash from 'slash';
import { traverse } from './lib';

export type Folder2RoutesPluginOptions = {
  folderPath?: string
  onRoute: (route: string) => void;
  routes?: string[];
};

export const folder: {routes: string[]} = {routes: []};

export default function (snowpackConfig: SnowpackConfig, options: Folder2RoutesPluginOptions): SnowpackPlugin {
  const routesTemplate = fs.readFileSync(path.join(__dirname, '../routes.js.hbs')).toString();
  return {
    name: 'snowpack-plugin-folder2routes',
    async transform({id, fileExt, contents}: PluginTransformOptions): Promise<PluginTransformResult | string | null | undefined | void> {
      // console.log({id, fileExt});
      if (id.endsWith('.routes.js')) { // TODO fileExt === '.routes.ts' ?
        // console.log({contents});
        const folderPath = path.dirname(id);
        const filepaths = traverse(folderPath);
        // TODO recursive
        const routeInfos = [];
        for (const file of filepaths) {
          if (file.directory) {
            continue;
          }
          if (file.name.startsWith('_')) {
            continue;
          }
          const filepath = slash(file.relativePath);
          const ext = path.extname(file.name);
          const filepathWithoutExtenstion = filepath.substr(0, filepath.length - ext.length);
          const protoName = filepathWithoutExtenstion.toLowerCase();
          const isIndexRoute = protoName === 'index' || protoName.endsWith('/index');

          let routePath = isIndexRoute ? (protoName === 'index' ? '' : protoName.substr(0, protoName.length - 6)) : protoName;
          const name = routePath === '' ? 'index' : routePath;
          const componentName = pascalCase(protoName);

          if (protoName === '_404') {
            routePath = '.*';
          }

          // console.log({componentName, protoName, routePath, filepath, filepathWithoutExtenstion, isIndexRoute, ext});

          routeInfos.push({
            componentName,
            importPath: `./${filepath}`,
            name,
            path: routePath,
            async:  protoName !== 'index' // TODO support generating multiple entry points
          })
          if(options.onRoute !== undefined) {
            options.onRoute(routePath);
          }
          if (options.routes) {
            options.routes.push(routePath);
          }
          folder.routes.push(routePath);
        }
        routeInfos.sort((route1, route2) => {
          if (route1.path === '.*') {
            return 1;
          }
          if (route2.path === '.*') {
            return -1
          }
          return 0;
        });
        const template = Handlebars.compile(routesTemplate);
        const result = template({routes: routeInfos});
        // console.log({result});
        return result;
      }
    },
  };
};
