const axios = require('axios')

// const re = /(europepmc.org\/articles\/PMC\d+)/ig;
const re = /(europepmc.org\/abstract\/MED\/\d+)/ig;

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

/*
 * Just reference
 * The drawback is that all HTTP requests are sent in parallel
 */
const crawl_ = urls => {
	var obj = new Promise(async (resolve, reject) => {
		let responses = await Promise.all(urls.map(url => {
			console.log('Handle URL: ', url)
			return axios({
				url
			})
		}))

		let totalSet = responses.map(response => {
			const pmidSet = new Set()
			let m
			do {
				m = re.exec(response.data);
				if (m) {
					pmidSet.add(m[1])
				}
			} while (m);
			return pmidSet
		}).reduce((a, b) => new Set([...a, ...b]), new Set())

		resolve(totalSet)
	})
	return obj
}

module.exports = { crawl }