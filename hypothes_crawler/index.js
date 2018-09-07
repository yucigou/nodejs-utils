const axios = require('axios')
const fs = require('fs')

const baseUrl = 'https://hypothes.is/groups/NMb8iAjd/europe-pmc'
const numberOfPages = 39
const pmidFileName = 'pmids.txt'
const re = /europepmc.org\/abstract\/MED\/(\d+)/g;
const urls = []

fs.truncateSync(pmidFileName, 0)
console.log(pmidFileName + ' cleared')

urls.push(baseUrl)

for (let i = 2; i <= numberOfPages; i++) {
	urls.push(baseUrl + '?page=' + i)
}

// console.log(urls)
console.log(`Number of urls: ${urls.length}`)

const writeToFile = pmidSet => {
	let pmidList = Array.from(pmidSet).reduce((a, b) => a + b + '\n', '');
	console.log('Write to file...: ', pmidList.length)
	fs.writeFileSync(pmidFileName, pmidList);
}

const crawl = urls => {
	var obj = new Promise((resolve, reject) => {
		const pmidSet = new Set()
		// (async ()=>{		
		// 	for (let i = 0; i < urls.length; i++) {
		// 		let url = urls[i];
		// 		console.log('Handle URL: ', url)
		// 		let response = await axios({url})

		// 		let m
		// 		do {
		// 		    m = re.exec(response.text);
		// 		    if (m) {
		// 		        pmidSet.add(m[1])
		// 		    }
		// 		} while (m);
		// 		console.log("Done with URL: " + url)
		// 		console.log("Go deal with next URL")	
		// 	}
		// })();
		// console.log("To be resolved")
		// resolve(pmidSet)

		let count = 0;
		urls.forEach(async url => {
			console.log(url)
			let response = await axios({url})

			let m
			do {
			    m = re.exec(response.data);
			    if (m) {
			        pmidSet.add(m[1])
			    }
			} while (m);

			count++;
			console.log(`Done with URL: ${url} (${count})`)
			if (count >= urls.length) {
				resolve(pmidSet)				
			}
		})
	})
	return obj
}

(async ()=>{
	let pmidSet = await crawl(urls)
	writeToFile(pmidSet)	
})();
