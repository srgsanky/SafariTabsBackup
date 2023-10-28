
const AMAZON_REGEX = /(?<canonical>https:\/\/www.amazon.com\/.*?\/dp\/[^/]+\/).*/;


// This method is copied from https://stackoverflow.com/questions/985272/selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
function selectText(nodeId) {
    const node = document.getElementById(nodeId);
    
    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}


// Copied from https://stackoverflow.com/questions/3436102/copy-to-clipboard-in-chrome-extension
function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        //clipboard successfully set
    }, () => {
        //clipboard write failed, use fallback
        console.error('Copy to clipboard failed')
    });
}


const button = document.querySelector("button");
button.addEventListener("click", async () => {
    // By not passing any selection in the query,
    // it returns tabs from all windows
    browser.tabs.query({},
                       (result) => {
        const all_urls = new Set()
        
        let output = []
        let count = 1
        output.push('||Name|URL|')
        output.push('|---|---|---|')
        for (const t of result) {
            let url = t.url
            const match = url.match(AMAZON_REGEX);
            if (match) {
                url = match.groups.canonical
            }
            if (url.length == 0) {
                continue
            }
            if (all_urls.has(url)) {
                browser.tabs.remove(t.id)
                continue
            }
            all_urls.add(url)
            let title = t.title
            // Replace char that will break the markdown table
            title = title.replaceAll('|', ':')
            output.push(`|${count}|${title}|${url}|`)
            count++
        }
        
        const table_text = output.join('\n')
        document.getElementById('output').innerText = table_text
        selectText('output')
        copyTextToClipboard(table_text)
    })
});

