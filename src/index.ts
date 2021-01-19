import type {PluginLoadOptions, PluginLoadResult, PluginOptimizeOptions, PluginRunOptions, PluginTransformOptions, PluginTransformResult, SnowpackConfig, SnowpackPlugin} from 'snowpack';
import Handlebars from "handlebars";
import fs from 'fs-extra';
import path from 'path';
import { pascalCase } from "pascal-case";

export type Folder2RoutesPluginOptions = {
  folderPath?: string
};

export default function (snowpackConfig: SnowpackConfig, options: Folder2RoutesPluginOptions): SnowpackPlugin {
  const routesTemplate = fs.readFileSync(path.join(__dirname, '../routes.js.hbs')).toString();
  // const filepath = (options.folderPath || './src/routes') + '/index.ts';
  // console.log({filepath})
  return {
    name: 'snowpack-plugin-folder2routes',
    // resolve: {
    //   input: ['.routes.ts'],
    //   output: ['.routes.js']
    // },

    // async load(options: PluginLoadOptions): Promise<PluginLoadResult | string | null | undefined | void> {
    //   console.log(options.filePath, options.fileExt);
    //   return "export default ['sd'];"
    // },
    async transform({id, fileExt, contents}: PluginTransformOptions): Promise<PluginTransformResult | string | null | undefined | void> {
      // console.log({id, fileExt});
      if (id.endsWith('.routes.js')) { // TODO fileExt === '.routes.ts' ?
        // console.log({contents});
        const folder = path.dirname(id);
        const filepaths = fs.readdirSync(folder);
        // TODO recursive
        const routes = [];
        for (const file of filepaths) {
          if (file.startsWith('_')) {
            continue;
          }
          const filepath = file;
          const ext = path.extname(file);
          const filenameWithoutExtenstion = filepath.substr(0, filepath.length - ext.length);
          const name = pascalCase(filenameWithoutExtenstion);
          const isIndexRoute = name === 'Index'; // TODO || name === 'Home';

          routes.push({
            importPath: `./${filepath}`,
            name,
            path: isIndexRoute ? '' : name.toLowerCase(),
            async: !isIndexRoute // TODO support generating multiple entry points
          })
        }
        const template = Handlebars.compile(routesTemplate);
        const result = template({routes});
        // console.log({result});
        return result;
      }
    },
    // async run(options: PluginRunOptions): Promise<void> {

    // },
    // async optimize({buildDirectory}: PluginOptimizeOptions): Promise<void> {

    // },
    // async cleanup(): Promise<void> {

    // },

    // knownEntrypoints: undefined,  // []
    // config(snowpackConfig: SnowpackConfig): void {

    // },
    onChange({ filePath }: {
        filePath: string;
    }): void {
      // TODO ?
    },
  };
};
