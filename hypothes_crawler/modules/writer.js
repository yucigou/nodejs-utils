const fs = require('fs')

const writeToFile = (pmidFileName, pmidSet) => {
	let pmidList = Array.from(pmidSet).reduce((a, b) => a + b + '\n', '');
	console.log('Write to file...: ', pmidSet.size)
	fs.writeFileSync(pmidFileName, pmidList);
}

const clearFile = pmidFileName => {
    fs.writeFileSync(pmidFileName, '')
}

module.exports = { writeToFile, clearFile }