#!/usr/bin/env node

const program = require('commander')
const pkg = require('../package.json')
const chalk = require('chalk')
const shell = require('shelljs')
const clone = require('git-clone')
const pathUtils = require('path')

const appName = 'Create Robot App'

function createProject(repo, path) {
  console.log(chalk.green(`Generate project to ${path}`))
  clone(repo, path, (error) => {
    if (error) {
      console.log(chalk.red(`Generate failure`))
      console.log(chalk.red(error))
    } else {
      console.log(chalk.green(`Generate completed`))
      console.log(chalk.green(`Removing .git`))
      shell.rm('-rf', `${path}/.git`)
      console.log(chalk.green(`Clean success`))
    }
  })
}

program.version(pkg.version)
  .action(options => {
    console.log("test commond ", options);
  })

program.command("create [path]")
  .description("Create team-based robot project")
  .option("-s --simple", "Simple project")
  .option("-l --large", "Large project")
  .action((path, options) => {
    let repo
    if (options.large) {
      console.log("Create large project");
      repo = "https://github.com/narospol/team-based-robot-large-template.git"
    } else {
      console.log("Create simple project");
      repo = "https://github.com/narospol/team-based-robot-simple-template.git"
    }
    createProject(repo, path)
  })

program.command("run <script> [variables] [outputDir] [tags]")
  .description("Run robot script")
  .option("-a --all", "Run all testcase")
  .option("-s --suite", "Run single test suite")
  .option("-t --tag", "Run width tag")
  .option("-r --rerunfailed", "Rerun failed testcase(s)")
  .action((script, variables, outputDir, tags, options) => {
    // console.log("Run robot script ", script, variables, tags)
    let variableCommand = ""
    let output = pathUtils.dirname(script)
    let tag = ""

    if (variables && variables != "") {
      variables.split(" ").forEach(v => {
        variableCommand = variableCommand + ` -v ${v}`
      })
      variableCommand = " " + variableCommand.trim()
    }
    if (outputDir) output = outputDir;
    if (tags) tag = tags;

    if (options.all || options.suite) {
      let command = ``
      if (options.rerunfailed) {
        command = `robot ${variableCommand} -d ${output}(rerunfailed) -R ${output}(rerunfailed)/output.xml ${script}`
      } else {
        command = `robot ${variableCommand} -d ${output} ${script}`
      }
      console.log(chalk.green(`[Command] robot${variableCommand} ${script}`))
      shell.exec(command, (code, stdout, stderr) => {
        if (code === 0) {
          console.log(chalk.green(`Run robot completed`))
        }
        else console.log(chalk.red(`Run robot failure`))
        if (options.rerunfailed) {
          // let mergeCommand = `rebot -o ${output}(rerunfailed)/output.xml --merge ${output}/output.xml`
          // shell.exec(mergeCommand, (code, stdout, stderr) => {
          //   console.log(code, 'code')
          // })
        } else {
          let mergeCommand = `rebot -o ${output}(rerunfailed)/output.xml --merge ${output}/output.xml`
          shell.exec(mergeCommand, (code, stdout, stderr) => {
            console.log(code, 'code')
          })
        }
      })


    } else if (options.tag) {
      const command = `robot ${variableCommand} -i ${tag} -d ${output} ${script}`
      console.log(chalk.green(`[Command] robot${variableCommand}  -i ${tag} ${script}`))
      shell.exec(command, (code, stdout, stderr) => {
        if (code === 0) console.log(chalk.green(`Run robot completed`))
        else console.log(chalk.red(`Run robot failure`))
      })

    } else {
      throw new Error("invalid command")
    }
  })

program.parse(process.argv)
