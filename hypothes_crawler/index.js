const crawler = require('./modules/crawler')
const writer = require('./modules/writer')

// Grab all given command line arguments after the third
const [, , ...args] = process.argv
if (args.length < 2) {
	console.log(`Usage: node index.js <output-file-name> <page-number>\nExample: node index.js /tmp/pmids.txt 39`)
	return;
}

const baseUrl = 'https://hypothes.is/groups/NMb8iAjd/europe-pmc'
const pmidFileName = args[0]
const numberOfPages = parseInt(args[1])
const urls = []

writer.clearFile(pmidFileName)
console.log(pmidFileName + ' cleared')

urls.push(baseUrl)

for (let i = 2; i <= numberOfPages; i++) {
	urls.push(baseUrl + '?page=' + i)
}

// console.log(urls)
console.log(`Number of urls: ${urls.length}`);

(async () => {
	let pmidSet = await crawler.crawl(urls)
	writer.writeToFile(pmidFileName, pmidSet)
})();