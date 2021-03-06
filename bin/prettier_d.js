#!/usr/bin/env node
'use strict'

function start() {
  require('../lib/launcher')()
}

const cmd = process.argv[2]
if (cmd === 'start') {
  start()
} else if (cmd === '-v' || cmd === '--version') {
  console.log(
    'v%s (prettier_d v%s)',
    require('prettier/package.json').version,
    require('../package.json').version
  )
} else if (cmd === '-h' || cmd === '--help') {
  const options = require('../lib/options')
  console.log(options.generateHelp())
} else {
  const client = require('../lib/client')
  if (cmd === 'restart') {
    client.stop(() => {
      process.nextTick(start)
    })
  } else {
    const commands = ['stop', 'status', 'restart']
    if (commands.indexOf(cmd) === -1) {
      const useStdIn = process.argv.indexOf('--stdin') > -1
      const args = process.argv.slice(2)

      if (!require('supports-color')) {
        args.unshift('--no-color')
      }

      if (useStdIn) {
        let text = ''
        process.stdin.setEncoding('utf8')

        process.stdin.on('data', chunk => {
          text += chunk
        })

        process.stdin.on('end', () => {
          client.lint(args, text)
        })
      } else {
        client.lint(args)
      }
    } else {
      client[cmd](process.argv.slice(3))
    }
  }
}
