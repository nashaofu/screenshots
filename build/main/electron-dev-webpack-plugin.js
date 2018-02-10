const chalk = require('chalk')
const electron = require('electron')
const childProcess = require('child_process')

module.exports = class ElectronDevWebpackPlugin {
  constructor (options) {
    this.process = []
    this.timer = null
  }

  apply (compiler) {
    compiler.plugin('done', stats => {
      const cp = childProcess.spawn(electron, [
        '--inspect=5858',
        '.'
      ])
      cp.stdout.on('data', data => {
        this.log(chalk.yellowBright.bold.strikethrough(data))
      })
      cp.stderr.on('data', data => {
        this.log(chalk.redBright.bold.strikethrough(data))
      })

      this.process.push(cp)
      if (this.process.length) {
        this.clearProcess()
      }
    })
  }

  /**
   * 清理旧进程
   */
  clearProcess () {
    for (let i = 0, length = this.process.length - 1; i < length; i++) {
      const cp = this.process[i]
      if (!cp.killed) {
        try {
          cp.kill()
        } catch (e) {
          console.log(`kill ${chalk.red(cp.pid)} process is failed, ${chalk.red(e)}`)
        }
      } else {
        this.process[i] = null
      }
    }
    this.process = this.process.filter(cp => cp)

    // 检查旧进程，防止没有被清理掉
    if (this.process.length > 1) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => this.clearProcess(), 1000)
    }
  }

  log (data) {
    console.log('---------------------Main Process Log Start---------------------')
    console.log(data)
    console.log('----------------------Main Process Log End----------------------')
  }
}
