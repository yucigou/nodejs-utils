const axios = require('axios')
const fs = require('fs')

// Grab all given command line arguments after the third
const [, , ...args] = process.argv
if (args.length < 2) {
	console.log(`Usage: node index.js <output-file-name> <page-number>\nExample: node index.js /tmp/pmids.txt 39`)
	return;
}

const baseUrl = 'https://hypothes.is/groups/NMb8iAjd/europe-pmc'
const pmidFileName = args[0]
const numberOfPages = parseInt(args[1])
// const re = /(europepmc.org\/articles\/PMC\d+)/ig;
const re = /(europepmc.org\/abstract\/MED\/\d+)/ig;
const urls = []

fs.writeFileSync(pmidFileName, '')
console.log(pmidFileName + ' cleared')

urls.push(baseUrl)

for (let i = 2; i <= numberOfPages; i++) {
	urls.push(baseUrl + '?page=' + i)
}

// console.log(urls)
console.log(`Number of urls: ${urls.length}`)

const writeToFile = pmidSet => {
	let pmidList = Array.from(pmidSet).reduce((a, b) => a + b + '\n', '');
	console.log('Write to file...: ', pmidSet.size)
	fs.writeFileSync(pmidFileName, pmidList);
}

const crawl = urls => {
	var obj = new Promise(async (resolve, reject) => {
		const pmidSet = new Set()
		for (let i = 0; i < urls.length; i++) {
			let url = urls[i];
			console.log('Handle URL: ', url)
			let response = await axios({
				url
			})

			let m
			do {
				m = re.exec(response.data);
				if (m) {
					pmidSet.add(m[1])
				}
			} while (m);

			if (i === urls.length - 1) {
				console.log("To be resolved")
				resolve(pmidSet)
			} else {
				console.log(`Go deal with next URL. Count ${pmidSet.size}`)
			}
		}
	})
	return obj
}

(async () => {
	let pmidSet = await crawl(urls)
	writeToFile(pmidSet)
})();