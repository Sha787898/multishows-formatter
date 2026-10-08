document.getElementById('formatBtn').addEventListener('click', processInput);
document.getElementById('clearBtn').addEventListener('click', clearAll);
document.getElementById('copyBtn').addEventListener('click', copyOutput);

function clearAll() {
    document.getElementById('rawInput').value = '';
    document.getElementById('output').textContent = '';
    document.getElementById('warningBox').style.display = 'none';
}

function copyOutput() {
    const text = document.getElementById('output').textContent;
    if (text) {
        navigator.clipboard.writeText(text);
        alert('কপি করা হয়েছে!');
    }
}

function extractSize(text) {
    const match = text.match(/[\[\(](\d+(?:\.\d+)?\s*(?:GB\vert{}MB))[\]\)]/i);
    return match ? ` [${match[1]}]` : '';
}

function parseFilename(filename, url) {
    const sizeStr = extractSize(filename);

    if (url.includes('short.azonahub') || url.includes('filesforever') || url.includes('gdmirrorbot') || url.includes('embed')) {
        return `Multi Server • MultiShows${sizeStr}`;
    }

    let res = "";
    if (/2160p|4K|UHD/i.test(filename)) res = "2160p";
    else if (/1080p/i.test(filename)) res = "1080p";
    else if (/720p/i.test(filename)) res = "720p";

    let bit = /10bit/i.test(filename) ? "10bit" : "";

    let hdr = "";
    if (/DV|DoVi|HDR-DV/i.test(filename)) {
        hdr = "DoVi HDR";
        if (/HDR10\+/i.test(filename)) hdr = "DoVi HDR10+";
        else if (/HDR10/i.test(filename)) hdr = "DoVi HDR10";
    } else if (/HDR10\+/i.test(filename)) {
        hdr = "HDR10+";
    } else if (/HDR/i.test(filename)) {
        hdr = "HDR";
    } else if (res === "2160p" && /SDR/i.test(filename)) {
        hdr = "SDR";
    }

    let codec = "";
    if (/AV1/i.test(filename)) {
        codec = "AV1";
    } else if (/x265/i.test(filename)) {
        codec = "HEVC (x265)";
    } else if (/H\.?265|HEVC/i.test(filename)) {
        codec = "HEVC (H.265)";
    } else if (/x264/i.test(filename)) {
        codec = "AVC (x264)";
    } else if (/H\.?264|AVC/i.test(filename)) {
        codec = "AVC (H.264)";
    }

    let source = "";
    if (/REMUX/i.test(filename)) {
        source = /UHD/i.test(filename) ? "BluRay • REMUX UHD" : "BluRay • REMUX";
    } else if (/Hybrid/i.test(filename)) {
        source = "Hybrid MA";
    } else if (/UHD.*BluRay|BluRay.*UHD/i.test(filename)) {
        source = "UHD BluRay";
    } else if (/BluRay/i.test(filename)) {
        source = "BluRay";
    } else if (/AMZN/i.test(filename)) {
        source = "AMZN";
    } else if (/\bNF\b/i.test(filename)) {
        source = "NF";
    } else if (/\bMA\b/i.test(filename)) {
        source = "MA";
    }

    let resBitHdrCodec = [res, bit, hdr, codec].filter(Boolean).join(" ");
    let finalLabel = resBitHdrCodec;
    if (source) {
        finalLabel += ` • ${source}`;
    }

    return `${finalLabel}${sizeStr}`.replace(/\s+/g, ' ').trim();
}

function processInput() {
    const raw = document.getElementById('rawInput').value.trim();
    const warningBox = document.getElementById('warningBox');
    warningBox.style.display = 'none';
    warningBox.innerHTML = '';

    if (!raw) return;

    const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
    
    let entries = [];
    let currentFileName = "";

    for (let line of lines) {
        if (line.startsWith('http')) {
            entries.push({
                file: currentFileName,
                url: line
            });
            currentFileName = ""; 
        } else {
            if (currentFileName) {
                currentFileName += " " + line;
            } else {
                currentFileName = line;
            }
        }
    }

    let isEpisodeSeries = entries.some(e => /S\d{2}E\d{2}/i.test(e.file));

    let resultOutput = "";

    if (isEpisodeSeries) {
        let epGroups = {};

        entries.forEach(item => {
            let epMatch = item.file.match(/S\d{2}E\d{2}/i);
            let epKey = epMatch ? epMatch[0].toUpperCase() : "GENERAL";
            
            if (!epGroups[epKey]) epGroups[epKey] = [];
            epGroups[epKey].push(item);
        });

        let epOutputs = [];

        for (let epKey in epGroups) {
            let items = epGroups[epKey];
            let firstFile = items[0].file;

            let showTitle = firstFile.replace(/\./g, ' ').split(/S\d{2}E\d{2}/i)[0].trim();
            showTitle = showTitle.replace(/Monster/i, "Monster:");

            let epHeader = `${showTitle} - ${epKey}`;
            
            let block = `\`${epHeader}\`\n\n\``;
            items.forEach(it => {
                let label = parseFilename(it.file, it.url);
                block += `${it.url} "${label}"\n`;
            });
            block = block.trim() + '`';
            epOutputs.push(block);
        }

        resultOutput = epOutputs.join('\n\n---\n\n');

    } else {
        let firstFile = entries[0] ? entries[0].file : "";
        let titleMatch = firstFile.match(/^([A-Za-z0-9.\-\s]+?)\s*\(?(\d{4})\)?/);
        
        let title = "";
        let year = "";

        if (titleMatch) {
            title = titleMatch[1].replace(/\./g, ' ').trim();
            year = titleMatch[2];
        } else {
            title = firstFile.split('.')[0] || "Title";
        }

        let headerText = year ? `${title} (${year})` : title;
        resultOutput = `\`${headerText}\`\n\n\``;

        entries.forEach(item => {
            let label = parseFilename(item.file, item.url);
            resultOutput += `${item.url} "${label}"\n`;
        });

        resultOutput = resultOutput.trim() + '`';
    }

    if (entries.length === 0) {
        warningBox.innerHTML = "⚠️ কোনো সঠিক URL পাওয়া যায়নি! অনুগ্রহ করে ইনপুট চেক করুন।";
        warningBox.style.display = 'block';
    }

    document.getElementById('output').textContent = resultOutput;
}
