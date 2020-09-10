import Handlebars from "handlebars";

import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync} from "fs";
import {extname, join, dirname, sep} from "path";
import * as chokidar from "chokidar";
import mjml from "mjml";


const layoutsPath = join(__dirname, './layouts')
const compiledPath = join(__dirname, './compiled')

const dirsToTriggerRecompileAll = ['style']
const dirsToExcludeCompile = ['style']

const compileTemplate = (pathToLayoutDir: string) => {
    const layoutPath = join(pathToLayoutDir, 'layout.mjml')
    const dataPath = join(pathToLayoutDir, 'data.json')

    const layout = readFileSync(layoutPath).toString()
    const data = existsSync(dataPath) ? JSON.parse(readFileSync(dataPath).toString()) : {}
    const template = Handlebars.compile(mjml(layout, {filePath: layoutPath}).html)
    return template(data)
}

const writeCompiledTemplate = (dirToSave, content) => {
    const filename = 'layout.html'
    try {
        mkdirSync(dirToSave)
    } catch (e) {
    }

    writeFileSync(join(dirToSave, filename), content)
}

const compileOne = (dirName) => {
    console.log(`compile ${dirName}`)
    const template = compileTemplate(join(layoutsPath, dirName))
    writeCompiledTemplate(join(compiledPath, dirName), template)
}

const compileAll = () => {
    return readdirSync(layoutsPath)
        .filter(dirName => !dirsToExcludeCompile.includes(dirName))
        .forEach(compileOne)
}


chokidar.watch(layoutsPath)
    .on('change', async (path: string) => {
        const dirName = dirname(path).split(sep).pop()
        console.log(`content in ${dirName} dir has been changed`)
        if (dirsToTriggerRecompileAll.includes(dirName)) {
            console.log('compile all')
            return compileAll()
        } else {
            console.log('compile one')
            return compileOne(dirName)
        }

    })

