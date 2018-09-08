const axios = require('axios')

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
    // console.log(urls)
    return urls
}

const createMapping = (doi, urls) => {
    return {doi, urls}
}

const crawl = async (src, ext_id) => {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=src%3A${src}%20and%20ext_id%3A${ext_id}&resultType=lite&synonym=FALSE&cursorMark=*&pageSize=25&format=json`
    const response = await axios({url})
    // const mapping = {doi, }
    const doi = response.data.resultList.result[0].doi
    const pmid = ext_id
    const pmcid = response.data.resultList.result[0].pmcid
    // console.log(response.data.resultList.result[0])
    return {doi, pmid, pmcid}
}

(async()=>{
    let ids = await crawl('MED', '24806729')
    let urls = createUrlList(ids.pmid, ids.pmcid)
    let mapping = createMapping(ids.doi, urls)
    console.log(mapping)
})();