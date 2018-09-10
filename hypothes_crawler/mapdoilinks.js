const axios = require('axios')
const fs = require('fs')
const readlines = require('n-readlines');
const writer = require('./modules/writer')
const crawler = require('./modules/crawler')
const urlUtils = require('./modules/url-utils')

const inputFilename = './testdata.txt'
// const inputFilename = './pmids.txt'
const outputFilename = './mappings.txt'
const errorFilename = './errors.txt'

writer.clearFile(errorFilename)

const processAllPmid = async () => {
    const re = /europepmc.org\/abstract\/MED\/(\d+)/ig;
    const liner = new readlines(inputFilename);
    const mappings = []
    let count = 0
    let line
    while (line = liner.next()) {
        let m
        do {
            m = re.exec(line);
            if (m) {
                let ids = await crawler.crawlEpmc('MED', m[1])
                if (ids) {
                    let urls = urlUtils.createUrlList(ids.pmid, ids.pmcid)
                    let mapping = {doi: ids.doi, urls}
                    mappings.push(mapping)    
                } else {
                    fs.appendFileSync(errorFilename, line + '\n');
                }
            }
        } while (m);
        console.log(`Done (${++count})`)
    }
    return mappings
}

(async () => {
    const mappings = await processAllPmid()
    console.log(`--------------------DONE (${mappings.length})------------------------`)
    fs.writeFileSync(outputFilename, JSON.stringify(mappings, null, 2));
})();
