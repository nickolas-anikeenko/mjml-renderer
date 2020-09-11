import mjml from "mjml";
import Handlebars from "handlebars";
import * as chokidar from "chokidar";
import {join, dirname, sep} from "path";
import {stat, mkdir, readdir, readFile, writeFile} from "fs";
import {promisify} from 'util'

const statAsync = promisify(stat)
const mkdirAsync = promisify(mkdir)
const readdirAsync = promisify(readdir)
const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)


const layoutsPath = join(__dirname, './layouts')
const compiledPath = join(__dirname, './compiled')

const dirsToTriggerRecompileAll = ['style']
const dirsToExcludeCompile = ['style']

const compileHandlebars = (content, data): string => {
    return Handlebars.compile(content)(data)
}

const compileMjml = (content, layoutPath) => {
    return mjml(content, {filePath: layoutPath}).html
}

const compileTemplate = async (pathToLayoutDir: string): Promise<string> => {
    const layoutPath = join(pathToLayoutDir, 'layout.mjml')
    const dataPath = join(pathToLayoutDir, 'data.json')

    const layout = (await readFileAsync(layoutPath)).toString()

    if (!layout.length) {
        throw new Error('Layout file is empty')
    }

    let data = {}
    try {
        await statAsync(dataPath)
        data = (await import (dataPath)).default
    } catch (e) {
    }
    return compileHandlebars(compileMjml(layout, layoutPath), data)
}

const writeCompiledTemplate = async (dirToSave, content): Promise<void> => {
    const filename = 'layout.html'
    try {
        await mkdirAsync(dirToSave)
    } catch (e) {
    }

    await writeFileAsync(join(dirToSave, filename), content)

    return
}

const compileOne = async (dirName): Promise<void> => {
    console.log(`compile ${dirName}`)
    try {
        const template = await compileTemplate(join(layoutsPath, dirName))
        await writeCompiledTemplate(join(compiledPath, dirName), template)
    } catch (e) {
        console.error(e)
    }
}

const compileAll = async (): Promise<void> => {
    return (await readdirAsync(layoutsPath))
        .filter(dirName => !dirsToExcludeCompile.includes(dirName))
        .forEach(compileOne)
}

const run = async () => {
    await compileAll()

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
}

run()
