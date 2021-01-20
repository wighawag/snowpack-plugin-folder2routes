"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverse = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
exports.traverse = function (dir, result = [], topDir, filter // TODO any is Stats
) {
    fs_extra_1.default.readdirSync(dir).forEach((name) => {
        const fPath = path_1.default.resolve(dir, name);
        const stats = fs_extra_1.default.statSync(fPath);
        if ((!filter && !name.startsWith('.')) || (filter && filter(name, stats))) {
            const fileStats = {
                name,
                path: fPath,
                relativePath: path_1.default.relative(topDir || dir, fPath),
                mtimeMs: stats.mtimeMs,
                directory: stats.isDirectory(),
            };
            if (fileStats.directory) {
                result.push(fileStats);
                return exports.traverse(fPath, result, topDir || dir, filter);
            }
            result.push(fileStats);
        }
    });
    return result;
};
