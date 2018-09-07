const axios = require('axios')
const fs = require('fs')

const baseUrl = 'https://hypothes.is/groups/NMb8iAjd/europe-pmc'
const numberOfPages = 39
const pmidFileName = 'pmids.txt'
const re = /(europepmc.org\/abstract\/MED\/\d+)/g;
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
	console.log('Write to file...: ', pmidSet.size)
	fs.writeFileSync(pmidFileName, pmidList);
}

const crawl_ = urls => {
	var obj = new Promise((resolve, reject) => {
		const pmidSet = new Set()
		let count = 0;
		urls.forEach(async (url, index) => {
			console.log(`Requesting URL: ${url}`)
			let response;
			try {
				response = await axios({url})
			} catch (error) {
				count++
				console.log(`Error with URL: ${url} (${count}, page ${index}), ${error}`)
				return;
			}
			count++
			console.log(`Done with URL: ${url} (${count}, page ${index})`)

			let m
			do {
			    m = re.exec(response.data);
			    if (m) {
			        pmidSet.add(m[1])
			    }
			} while (m);

			if (count >= urls.length) {
				console.log(`${count} pages done. Resolving promise.`)
				resolve(pmidSet)				
			}
		})
	})
	return obj
}

const crawl = urls => {
	var obj = new Promise((resolve, reject) => {
		(async ()=>{		
			const pmidSet = new Set()
			for (let i = 0; i < urls.length; i++) {
				let url = urls[i];
				console.log('Handle URL: ', url)
				let response = await axios({url})
				
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
					console.log("Go deal with next URL")
				}
			}
		})();
	})
	return obj
}

(async ()=>{
	let pmidSet = await crawl(urls)
	writeToFile(pmidSet)	
})();
