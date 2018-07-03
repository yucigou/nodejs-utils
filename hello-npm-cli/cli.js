#!/usr/bin/env node

console.log(process.argv)

// Grab all given command line arguments after the third
const [,, ...args] = process.argv

// Print hello world
console.log(`Hello World ${args}`)