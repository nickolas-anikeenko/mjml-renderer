import Handlebars from "handlebars";

import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from "fs";
import {extname, join} from "path";
import * as chokidar from "chokidar";
import mjml from "mjml";


const layoutsPath = join(__dirname, './layouts')
const compiledPath = join(__dirname, './compiled')

const dirsToRecompileAlways = ['style']

const compile = (dirname: string) => {
    const layoutPath = join(layoutsPath, dirname, 'layout.mjml')
    const dataPath = join(layoutsPath, dirname, 'data.json')

    const layout = readFileSync(layoutPath).toString()
    const data = existsSync(dataPath) ? JSON.parse(readFileSync(dataPath).toString()) : {}
    const template = Handlebars.compile(mjml(layout, {filePath: layoutPath}).html)
    return template(data)
}

const writeCompiled = (dirToSave, content) => {
    const filename = 'layout.html'
    try {
        mkdirSync(dirToSave)
    } catch (e) {
    }

    writeFileSync(join(dirToSave, filename), content)
}

chokidar.watch(layoutsPath)
    .on('change', (path: string) => console.log(path))

