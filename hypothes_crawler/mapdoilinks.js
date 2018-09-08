const axios = require('axios')
const fs = require('fs')
const readlines = require('n-readlines');
const writer = require('./modules/writer')

// const inputFilename = './testdata.txt'
const inputFilename = './pmids.txt'
const outputFilename = './mappings.txt'
const errorFilename = './errors.txt'

writer.clearFile(errorFilename)

const liner = new readlines(inputFilename);
const domain = 'europepmc.org'
const sub_domains = ['', 'beta.', 'test.', 'dev.', 'staging.']
const protocols = ['http', 'https']

const createUrlList = (pmid, pmcid) => {
    const urls = []
    if (pmid) {
        const pmidUrls = protocols.map(protocol => {
            return sub_domains.map(sub => {
                return `${protocol}://${sub}${domain}/abstract/MED/${pmid}`
            })
        }).reduce((acc, val) => acc.concat(val), [])
        urls.push(...pmidUrls)
    }

    if (pmcid) {
        const pmcidUrls = protocols.map(protocol => {
            return sub_domains.map(sub => {
                return `${protocol}://${sub}${domain}/articles/${pmcid}`
            })
        }).reduce((acc, val) => acc.concat(val), [])
        urls.push(...pmcidUrls)
    }
    return urls
}

const createMapping = (doi, urls) => {
    return {doi, urls}
}

const crawl = async (src, ext_id) => {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=src%3A${src}%20and%20ext_id%3A${ext_id}&resultType=lite&synonym=FALSE&cursorMark=*&pageSize=25&format=json`
    console.log(`Handling URL: search?query=src%3A${src}%20and%20ext_id%3A${ext_id}&resultType=lite&synonym=FALSE&cursorMark=*&pageSize=25&format=json`)    
    const response = await axios({url})
    if (response.data.resultList.result.length === 0) {
        return null;
    }
    const doi = response.data.resultList.result[0].doi
    const pmid = ext_id
    const pmcid = response.data.resultList.result[0].pmcid
    return {doi, pmid, pmcid}
}

const re = /europepmc.org\/abstract\/MED\/(\d+)/ig;
const mappings = []

const processAllPmid = async () => {
    let count = 0
    let line
    while (line = liner.next()) {
        let m
        do {
            m = re.exec(line);
            if (m) {
                let ids = await crawl('MED', m[1])
                if (ids) {
                    let urls = createUrlList(ids.pmid, ids.pmcid)
                    let mapping = createMapping(ids.doi, urls)
                    mappings.push(mapping)    
                } else {
                    fs.appendFileSync(errorFilename, line + '\n');
                }
            }
        } while (m);
        console.log(`Done (${++count})`)
    }
}

(async () => {
    await processAllPmid()
    console.log(`--------------------DONE (${mappings.length})------------------------`)
    fs.writeFileSync(outputFilename, JSON.stringify(mappings, null, 2));
})();
