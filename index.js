#!/usr/bin/env node

const fcl = require("@onflow/fcl")
const fs = require("fs")
const path = require("path")

const ACCESS_NODE =
  process.env.ACCESS_NODE || "https://access-testnet.onflow.org"

fcl.config().put("accessNode.api", ACCESS_NODE)

let [N, FILE] = process.argv.slice(2)
N = Number(N || 1)

console.log("FILE:", FILE)

const DEFAULT_SCRIPT = `
  pub fun main(): Int {
    return 42
  }
`.trim()

const SCRIPT = String(
  FILE != null
    ? (function () {
        try {
          return fs
            .readFileSync(path.resolve(process.cwd(), FILE), "utf8")
            .trim()
        } catch (error) {
          throw new Error(`Invalid File: ${FILE}`)
        }
      })()
    : DEFAULT_SCRIPT
)

;(async function main() {
  const T1 = Date.now()
  try {
    console.log(`${N} Script Excutions scheduled to target: ${ACCESS_NODE}`)
    console.log("---SCRIPT---\n\n", SCRIPT, "\n\n------------")
    console.log(
      "SUCCESS",
      await Promise.all(
        Array.from({length: N}, () =>
          fcl.send([fcl.script(SCRIPT)]).then(fcl.decode)
        )
      )
    )

    console.log(`Time: ${Date.now() - T1}ms`)
  } catch (error) {
    console.error("BAD BAD NOT GOOD", error)
    console.log(`Time: ${Date.now() - T1}ms`)
    throw error
  }
})()
