const mjml = require('mjml')
const { extname, join } = require('path')
const Handlebars = require('handlebars')
const { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } = require('fs')

const layoutsPath = join(__dirname, './layouts')
const compiledPath = join(__dirname, './compiled')

readdirSync(layoutsPath).forEach(dirname => {
  if (dirname === 'style') return
  const layoutPath = join(layoutsPath, dirname, 'layout.mjml')
  const dataPath = join(layoutsPath, dirname, 'data.json')

  const layout = readFileSync(layoutPath).toString()
  const data = existsSync(dataPath) ? JSON.parse(readFileSync(dataPath).toString()) : {}
  const template = Handlebars.compile(mjml(layout, { filePath: layoutPath }).html)
  const rendered = template({ ...data })
  console.log(rendered)

  try {
    mkdirSync(join(compiledPath, dirname))
  } catch (e) {

  }

  writeFileSync(join(compiledPath, dirname, 'layout.html'), rendered)
})

