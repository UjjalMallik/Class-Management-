const fs = require("node:fs")
const path = require("node:path")

const projectRoot = path.resolve(__dirname, "..")
const packagePath = path.join(projectRoot, "package.json")
const gradlePath = path.join(projectRoot, "android", "app", "build.gradle")
const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"))
const version = String(packageJson.version).trim().replace(/^v/i, "")
const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/)

if (!match) {
  throw new Error(`Expected package.json version to use major.minor.patch format, received: ${version}`)
}

const versionCode = Number(match[3])
if (!Number.isInteger(versionCode) || versionCode < 1) {
  throw new Error(`The patch version must be a positive integer for Android versionCode: ${version}`)
}

let buildGradle = fs.readFileSync(gradlePath, "utf8")
buildGradle = buildGradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
buildGradle = buildGradle.replace(/versionName\s+["'][^"']+["']/, `versionName "${version}"`)
fs.writeFileSync(gradlePath, buildGradle)
console.log(`Synced Android versionName ${version} and versionCode ${versionCode}`)