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

module.exports = { createUrlList }