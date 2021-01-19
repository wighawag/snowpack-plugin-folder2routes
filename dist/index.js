"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const handlebars_1 = __importDefault(require("handlebars"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const pascal_case_1 = require("pascal-case");
function default_1(snowpackConfig, options) {
    const routesTemplate = fs_extra_1.default.readFileSync(path_1.default.join(__dirname, '../routes.js.hbs')).toString();
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
        async transform({ id, fileExt, contents }) {
            // console.log({id, fileExt});
            if (id.endsWith('.routes.js')) { // TODO fileExt === '.routes.ts' ?
                // console.log({contents});
                const folder = path_1.default.dirname(id);
                const filepaths = fs_extra_1.default.readdirSync(folder);
                // TODO recursive
                const routes = [];
                for (const file of filepaths) {
                    if (file.startsWith('_')) {
                        continue;
                    }
                    const filepath = file;
                    const ext = path_1.default.extname(file);
                    const filenameWithoutExtenstion = filepath.substr(0, filepath.length - ext.length);
                    const name = pascal_case_1.pascalCase(filenameWithoutExtenstion);
                    const isIndexRoute = name === 'Index'; // TODO || name === 'Home';
                    routes.push({
                        importPath: `./${filepath}`,
                        name,
                        path: isIndexRoute ? '' : name.toLowerCase(),
                        async: !isIndexRoute // TODO support generating multiple entry points
                    });
                }
                const template = handlebars_1.default.compile(routesTemplate);
                const result = template({ routes });
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
        onChange({ filePath }) {
            // TODO ?
        },
    };
}
exports.default = default_1;
;
