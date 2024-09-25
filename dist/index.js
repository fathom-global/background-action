require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 158:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(766)
const parseDuration = __nccwpck_require__(15)

function getRawInputs() {
    const run = core.getInput('run')
    const name = core.getInput('name')
    const waitOn = core.getInput('wait-on')
    const waitFor = core.getInput('wait-for')
    const tail = core.getInput('tail')

    const logOutput = core.getInput('log-output')
    const logOutputResume = core.getInput('log-output-resume')
    const logOutputIf = core.getInput('log-output-if')
    const workingDirectory = core.getInput('working-directory')

    return { run, name, waitOn, waitFor, tail, logOutput, logOutputResume, logOutputIf, workingDirectory }
}

function parseLogOption(str) {
    const option = { stdout: false, stderr: false }
    if (str === 'true') return { stdout: true, stderr: true }
    if (str === 'false') return option
    if (str.includes('stdout')) option.stdout = true
    if (str.includes('stderr')) option.stderr = true

    return option
}

function normalizeInputs(inputs) {
    let { run, name, waitOn, waitFor, tail, logOutput, logOutputResume, logOutputIf, workingDirectory } = inputs

    tail = parseLogOption(tail)
    logOutputResume = parseLogOption(logOutputResume)
    logOutput = parseLogOption(logOutput)

    if (logOutputIf && /true|false|failure|exit-early|timeout|success/.test(logOutputIf) == false) {
        throw new Error(`Invalid input for: log-output-if, expecting: true,false,failure,exit-early,timeout,success received: ${logOutputIf}`)
    }

    try {
        // allow JSON configurations for advanced usage
        const waitOnConfig = JSON.parse(waitOn)
        waitOn = waitOnConfig
    } catch (e) {
        waitOn = {
            resources: waitOn.split(/\n|,/).map(resource => resource.trim()).filter(line => line !== ''),
            timeout: parseDuration(waitFor),
            verbose: core.isDebug(),
            log: !tail.stderr && !tail.stdout // provide some interactive feedback if we're not tailing
        }

        if (waitOn.resources.length === 0) throw new Error('You must provide one or more resources, see: https://github.com/jeffbski/wait-on#readme')
    }

    return { run, name, waitOn, waitFor, tail, logOutput, logOutputResume, logOutputIf, workingDirectory }
}

module.exports = normalizeInputs(getRawInputs())


/***/ }),

/***/ 458:
/***/ ((__unused_webpack_module, __unused_webpack_exports, __nccwpck_require__) => {

const core = __nccwpck_require__(766)
const inputs = __nccwpck_require__(158)
const fs = __nccwpck_require__(896)
const path = __nccwpck_require__(928)

const { logOutput, logOutputResume, logOutputIf, workingDirectory } = inputs

const pid = core.getState('post-run')
const reason = core.getState(`reason_${pid}`)
const stdout = parseInt(core.getState('stdout') || 0, 10)
const stderr = parseInt(core.getState('stderr') || 0, 10)

const cwd = workingDirectory || process.env.GITHUB_WORKSPACE || './'
const stdoutPath = path.join(cwd, `${pid}.out`)
const stderrPath = path.join(cwd, `${pid}.err`)

const shouldLog = logOutputIf === 'true' || logOutputIf === reason || (logOutputIf === 'failure' && (reason === 'exit-early' || reason === 'timeout'))

if (core.isDebug()) {
  core.debug(`stdout: ${stdout}`)
  core.debug(`stderr: ${stderr}`)
  core.debug(`stdoutPath: ${stdoutPath}`)
  core.debug(`stderrPath: ${stderrPath}`)
  core.debug(`shouldLog: ${shouldLog}`)
  core.debug(`logOutput: ${logOutput}`)
  core.debug(`logOutputResume: ${logOutputResume}`)
  core.debug(`logOutputIf: ${logOutputIf}`)
  core.debug(`workingDirectory: ${workingDirectory}`)
  core.debug(`pid: ${pid}`)
  core.debug(`reason: ${reason}`)
  core.debug(`cwd: ${cwd}`)
}

function streamLog(path, start) {
  return new Promise((resolve, reject) => {
    const log = fs.createReadStream(path, { start, emitClose: true, encoding: 'utf8', autoClose: true })
    log.on('close', () => resolve(null))
    log.on('error', (err) => reject(err))
    log.pipe(process.stdout)
  })
}

async function streamLogs() {
  if (logOutput.stdout) {
    const start = logOutputResume.stdout ? stdout : 0
    const truncated = start > 0
    await core.group(`${logOutputResume.stdout ? 'Truncated ' : ''}Output:`, async () => {
      if (truncated) console.log(`Truncated ${start} bytes of tailed stdout output`)
      try {
        await streamLog(stdoutPath, start)
      } catch(err) {
        console.error('Error streaming stdout:', err)
      }
    })
  }

  if (logOutput.stderr) {
    const start = logOutputResume.stderr ? stderr : 0
    const truncated = start > 0
    await core.group(`${logOutputResume.stderr ? 'Truncated ' : ''}Error Output:`, async () => {
      if (truncated) console.log(`Truncated ${start} bytes of tailed stderr output`)
      try {
        await streamLog(stderrPath, start)
      } catch(err) {
        console.error('Error streaming stderr:', err)
      }
    })
  }
}

(async() => {
    try {
      if (shouldLog) {
        await streamLogs()
      }
    } catch(err) {
        console.error('Error streaming logs:', err)
    } finally {
        process.exit(0)
    }
})();

/***/ }),

/***/ 766:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 15:
/***/ ((module) => {

module.exports = eval("require")("parse-duration");


/***/ }),

/***/ 255:
/***/ ((module) => {

module.exports = eval("require")("tail");


/***/ }),

/***/ 444:
/***/ ((module) => {

module.exports = eval("require")("wait-on");


/***/ }),

/***/ 317:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
const core = __nccwpck_require__(766)
const WaitOn = __nccwpck_require__(444)
const Tail = (__nccwpck_require__(255).Tail)
const path = __nccwpck_require__(928)
const spawn = (__nccwpck_require__(317).spawn)
const inputs = __nccwpck_require__(158)

const { run, workingDirectory, waitOn, tail, logOutput } = inputs
const POST_RUN = core.getState('post-run')

let stderr, stdout

if (core.isDebug()) {
  console.log(process.env)
}

// serve as the entry-point for both main and post-run invocations
if (POST_RUN) {
  __nccwpck_require__(458)
} else {
  (async function () {
    core.saveState('post-run', process.pid)

    const cwd = workingDirectory || process.env.GITHUB_WORKSPACE || './'
    const stdErrFile = path.join(cwd, `${process.pid}.err`)
    const stdOutFile = path.join(cwd, `${process.pid}.out`)

    const checkStderr = setInterval(() => {
      stderr = TailWrapper(stdErrFile, tail.stderr, core.info)
      if (stderr) clearInterval(checkStderr)
    }, 1000)

    const checkStdout = setInterval(() => {
      stdout = TailWrapper(stdOutFile, tail.stdout, core.info)
      if (stdout) clearInterval(checkStdout)
    }, 1000)

    runCommand(run)

    WaitOn(waitOn, (err) => exitHandler(err, err ? 'timeout' : 'success'))
  })()
}

async function exitHandler(error, reason) {
  if (stdout && stdout.unwatch) stdout.unwatch()
  if (stderr && stderr.unwatch) stderr.unwatch()

  core.saveState(`reason_${process.pid}`, reason)
  if (stdout && stdout.pos) core.saveState('stdout', stdout.pos)
  if (stderr && stderr.pos) core.saveState('stderr', stderr.pos)

  if (error) {
    core.error(error)
    core.setFailed(error.message)
  }
  process.exit(error ? 1 : 0)
}

function runCommand(run) {
  let cmd = `(${run} wait)`

  const spawnOpts = { detached: true, stdio: 'ignore' }

  if (workingDirectory) spawnOpts.cwd = workingDirectory

  const pipeStdout = tail.stdout || logOutput.stdout
  const pipeStderr = tail.stderr || logOutput.stderr

  if (pipeStdout) cmd += ` > ${process.pid}.out`
  if (pipeStderr) cmd += ` 2> ${process.pid}.err`

  const shell = spawn('bash', ['--noprofile', '--norc', '-eo', 'pipefail', '-c', cmd], spawnOpts)
  shell.on('error', (err) => exitHandler(err, 'exit-early'))
  shell.on('close', () => exitHandler(new Error('Exited early'), 'exit-early'))
}

function TailWrapper(filename, shouldTail, output) {
  if (!shouldTail) return false

  try {
    const tail = new Tail(filename, { flushAtEOF: true })
    tail.on('line', output)
    tail.on('error', core.warning)
    return tail
  } catch (e) {
    console.warn('background-action tried to tail a file before it was ready....')
    return false
  }
}

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=index.js.map