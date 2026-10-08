document.getElementById('formatBtn').addEventListener('click', parseAndFormat);
document.getElementById('clearBtn').addEventListener('click', () => {
    document.getElementById('rawInput').value = '';
    document.getElementById('outputContainer').textContent = '';
});

document.getElementById('copyBtn').addEventListener('click', () => {
    const text = document.getElementById('outputContainer').textContent;
    if (text) {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    }
});

function parseAndFormat() {
    const raw = document.getElementById('rawInput').value.trim();
    if (!raw) return;

    const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
    let titleHeader = "Media Title (Year) | Multi Audio";
    let links = [];

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        if (line.startsWith('http')) {
            let prevLine = i > 0 ? lines[i - 1] : '';
            let label = generateLabel(prevLine, line);
            links.push({ url: line, label: label });
        }
    }

    // Build mono outputs
    let outputText = "";
    
    // Check main header size if available
    let mainSize = extractSize(lines[0]) || "";
    let mainTitleClean = cleanTitleHeader(lines[0]) || "Title (2026)";

    outputText += `\`${mainTitleClean} 1080p \vert{} Multi Audio${mainSize ? '[' + mainSize + ']' : ''}\`\n\n\``;

    links.forEach(item => {
        outputText += `${item.url} "${item.label}"\n`;
    });

    outputText = outputText.trim() + '`';

    document.getElementById('outputContainer').textContent = outputText;
}

function cleanTitleHeader(line) {
    if (!line) return "";
    let clean = line.replace(/\.(mkv|mp4|avi)$/i, '')
                    .replace(/\./g, ' ')
                    .replace(/\[.*?\]/g, '')
                    .trim();
    return clean.split(' ')[0] || "Title";
}

function extractSize(str) {
    let match = str.match(/\[(\d+(\.\d+)?\s*(GB\vert{}MB))\]/i) || str.match(/\((\d+(\.\d+)?\s*(GB\vert{}MB))\)/i);
    return match ? match[1] : '';
}

function generateLabel(filename, url) {
    if (url.includes('short.azonahub') || url.includes('filesforever') || url.includes('embed')) {
        return "Multi Server";
    }

    let size = extractSize(filename);
    let sizeStr = size ? ` [${size}]` : '';

    let res = "";
    if (filename.includes("2160p") || filename.includes("4K")) res = "2160p";
    else if (filename.includes("1080p")) res = "1080p";
    else if (filename.includes("720p")) res = "720p";

    let hdr = "";
    if (filename.includes("DV") || filename.includes("DoVi")) hdr = " DoVi HDR";
    else if (filename.includes("HDR")) hdr = " HDR";
    else if (filename.includes("SDR")) hdr = " SDR";

    let codec = "";
    if (filename.includes("AV1")) codec = " (AV1)";
    else if (filename.includes("x265")) codec = " (x265)";
    else if (filename.includes("H.265") || filename.includes("HEVC")) codec = " (H.265)";
    else if (filename.includes("H.264") || filename.includes("AVC")) codec = " (H.264)";

    let source = "";
    if (filename.includes("AMZN")) source = " • AMZN";
    else if (filename.includes("NF")) source = " • NF";
    else if (filename.includes("iT") || filename.includes("iTunes")) source = " • iT";
    else if (filename.includes("MA")) source = " • MA";
    else if (filename.includes("BCORE")) source = " • BCORE";

    return `${res}${hdr}${codec}${source}${sizeStr}`.trim();
}
