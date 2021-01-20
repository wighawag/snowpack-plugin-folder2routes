"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.folder = void 0;
const handlebars_1 = __importDefault(require("handlebars"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const pascal_case_1 = require("pascal-case");
const slash_1 = __importDefault(require("slash"));
const lib_1 = require("./lib");
exports.folder = { routes: [] };
function default_1(snowpackConfig, options) {
    const routesTemplate = fs_extra_1.default.readFileSync(path_1.default.join(__dirname, '../routes.js.hbs')).toString();
    return {
        name: 'snowpack-plugin-folder2routes',
        async transform({ id, fileExt, contents }) {
            // console.log({id, fileExt});
            if (id.endsWith('.routes.js')) { // TODO fileExt === '.routes.ts' ?
                // console.log({contents});
                const folderPath = path_1.default.dirname(id);
                const filepaths = lib_1.traverse(folderPath);
                // TODO recursive
                const routeInfos = [];
                for (const file of filepaths) {
                    if (file.directory) {
                        continue;
                    }
                    if (file.name.startsWith('_')) {
                        continue;
                    }
                    const filepath = slash_1.default(file.relativePath);
                    const ext = path_1.default.extname(file.name);
                    const filepathWithoutExtenstion = filepath.substr(0, filepath.length - ext.length);
                    const protoName = filepathWithoutExtenstion.toLowerCase();
                    const isIndexRoute = protoName === 'index' || protoName.endsWith('/index');
                    const routePath = isIndexRoute ? (protoName === 'index' ? '' : protoName.substr(0, protoName.length - 6)) : protoName;
                    const name = routePath === '' ? 'index' : routePath;
                    const componentName = pascal_case_1.pascalCase(protoName);
                    // console.log({componentName, protoName, routePath, filepath, filepathWithoutExtenstion, isIndexRoute, ext});
                    routeInfos.push({
                        componentName,
                        importPath: `./${filepath}`,
                        name,
                        path: routePath,
                        async: protoName !== 'index' // TODO support generating multiple entry points
                    });
                    if (options.onRoute !== undefined) {
                        options.onRoute(routePath);
                    }
                    if (options.routes) {
                        options.routes.push(routePath);
                    }
                    exports.folder.routes.push(routePath);
                }
                const template = handlebars_1.default.compile(routesTemplate);
                const result = template({ routes: routeInfos });
                // console.log({result});
                return result;
            }
        },
    };
}
exports.default = default_1;
;
