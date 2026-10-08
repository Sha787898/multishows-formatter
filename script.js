// Smooth Subtle Background Particles Animation
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.8 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.alpha = Math.random() * 0.4 + 0.1;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
        ctx.fillStyle = `rgba(239, 68, 68, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for (let i = 0; i < 45; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

/* Action Handler Logic */
function clearAll() {
    document.getElementById('rawInput').value = '';
    document.getElementById('output').value = '';
    document.getElementById('findInput').value = '';
    document.getElementById('replaceInput').value = '';
    document.getElementById('warningBox').style.display = 'none';
}

function copyOutput() {
    const text = document.getElementById('output').value;
    if (text) {
        navigator.clipboard.writeText(text);
        alert('Output copied to clipboard!');
    }
}

function applyReplace() {
    const findText = document.getElementById('findInput').value;
    const replaceText = document.getElementById('replaceInput').value;
    const outputArea = document.getElementById('output');

    if (!findText) return;
    const regex = new RegExp(escapeRegExp(findText), 'g');
    outputArea.value = outputArea.value.replace(regex, replaceText);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Rock-solid File Size Extraction Logic
function extractSize(text) {
    if (!text) return '';
    const match = text.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i);
    return match ? ` [${match[1]} ${match[2].toUpperCase()}]` : '';
}

// Helper to calculate numerical value in GB
function parseSizeToGB(text) {
    if (!text) return 0;
    const match = text.match(/(\d+(?:\.\d+)?)\s*(GB|MB)/i);
    if (!match) return 0;
    let val = parseFloat(match[1]);
    let unit = match[2].toUpperCase();
    return unit === 'MB' ? val / 1024 : val;
}

// Clean Title & Auto-append Year e.g., Insidious - Out of the Further (2026)
function cleanTitle(filename) {
    if (!filename) return "pack files";

    const yearMatch = filename.match(/(?:19|20)\d{2}/);
    let yearStr = yearMatch ? ` (${yearMatch[0]})` : "";

    let titlePart = filename;
    if (yearMatch) {
        titlePart = filename.split(/(?:19|20)\d{2}/i)[0];
    } else {
        titlePart = filename.split(/S\d{2}/i)[0];
    }

    let cleanName = titlePart
        .split(/AKA/i)[0]
        .replace(/[\.\_]/g, ' ')
        .replace(/[\-\(\)\[\]]+$/, '')
        .trim();

    if (!cleanName) cleanName = "Movie";

    return `${cleanName}${yearStr}`;
}

function parseFilename(filename, url, totalAvcPackSizeGB = 0) {
    const sizeStr = extractSize(filename);

    // Embedded / Shortened Links
    if (url.includes('short.azonahub') || url.includes('filesforever') || url.includes('embed')) {
        return `Multi Server • MultiShows${sizeStr}`;
    }

    // Resolution Detection
    let res = "";
    if (/2160p|4K|UHD/i.test(filename)) res = "2160p";
    else if (/720p/i.test(filename)) res = "720p";
    else res = "1080p";

    let bit = /10bit/i.test(filename) ? "10bit" : "";

    // Codec Detection
    let codec = "";
    if (/AV1/i.test(filename)) {
        codec = "AV1";
    } else if (/x265/i.test(filename)) {
        codec = "HEVC (x265)";
    } else if (/H\.?265|HEVC/i.test(filename)) {
        codec = "HEVC (H.265)";
    } else if (/x264/i.test(filename)) {
        codec = "AVC (x264)";
    } else {
        codec = "AVC (H.264)";
    }

    // HDR/SDR Detection
    let hdr = "";
    if (/DV|DoVi|HDR-DV/i.test(filename)) hdr = "DoVi HDR";
    else if (/HDR10\+/i.test(filename)) hdr = "HDR10+";
    else if (/HDR/i.test(filename)) hdr = "HDR";
    else if (res === "2160p" || /SDR/i.test(filename)) hdr = "SDR";

    // Source Tag Detection
    let source = "";
    if (/REMUX/i.test(filename)) source = "BluRay • REMUX";
    else if (/BluRay/i.test(filename)) source = "BluRay";
    else if (/NF/i.test(filename)) source = "NF";
    else if (/ZEE5/i.test(filename)) source = "ZEE5";
    else if (/DSNP|Hotstar/i.test(filename)) source = "DSNP";
    else source = "AMZN";

    let resBitHdrCodec = [res, bit, hdr, codec].filter(Boolean).join(" ");

    // PACK File Logic
    let isPack = /pack/i.test(filename) || /pack/i.test(url);
    if (isPack) {
        let packSize = totalAvcPackSizeGB > 0 ? ` [${totalAvcPackSizeGB.toFixed(2)} GB]` : sizeStr;
        return `${resBitHdrCodec} • ${source}${packSize} [PACK]`.replace(/\s+/g, ' ').trim();
    }

    // Normal Download Links - Forced sizeStr addition
    let finalLabel = resBitHdrCodec ? `${resBitHdrCodec} • ${source}` : source;
    return `${finalLabel}${sizeStr}`.replace(/\s+/g, ' ').trim();
}

function processInput() {
    const raw = document.getElementById('rawInput').value.trim();
    const warningBox = document.getElementById('warningBox');
    warningBox.style.display = 'none';

    if (!raw) return;

    const lines = raw.split('\n').map(l => l.trim()).filter(l => l);
    let entries = [];
    let currentText = "";
    let lastFileText = "";

    for (let line of lines) {
        if (line.startsWith('http://') || line.startsWith('https://')) {
            let fileToUse = currentText || lastFileText;
            entries.push({ file: fileToUse, url: line });
            if (currentText) {
                lastFileText = currentText;
            }
            currentText = "";
        } else {
            currentText = currentText ? currentText + " " + line : line;
        }
    }

    // Sum size of ONLY AVC / H.264 files
    let totalAvcSizeGB = 0;
    entries.forEach(item => {
        const isAvc = !/AV1|HEVC|x265|H\.?265/i.test(item.file);
        if (isAvc) {
            totalAvcSizeGB += parseSizeToGB(item.file);
        }
    });

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
            let showTitle = cleanTitle(firstFile);

            let block = `\`${showTitle} -${epKey}\`\n\n\``;
            items.forEach(it => {
                let label = parseFilename(it.file, it.url, totalAvcSizeGB);
                block += `${it.url} "${label}"\n`;
            });
            block = block.trim() + '`';
            epOutputs.push(block);
        }
        resultOutput = epOutputs.join('\n\n---\n\n');

    } else {
        let mainTitle = entries.length > 0 ? cleanTitle(entries[0].file) : "pack files";
        resultOutput = `\`${mainTitle} \`\n\n\``;

        entries.forEach(item => {
            let label = parseFilename(item.file, item.url, totalAvcSizeGB);
            resultOutput += `${item.url} "${label}"\n`;
        });
        resultOutput = resultOutput.trim() + '`';
    }

    if (entries.length === 0) {
        warningBox.innerHTML = "⚠️ No valid links found in input!";
        warningBox.style.display = 'block';
    }

    document.getElementById('output').value = resultOutput;
}

/* Google Drive Link Extractor */
function extractGDriveLinks() {
    const input = document.getElementById('gdriveInput').value.trim();
    const outputArea = document.getElementById('gdriveOutput');

    if (!input) return;

    const gdriveFolderRegex = /(https?:\/\/drive\.google\.com\/(?:drive\/folders\/|folderview\?id=)[a-zA-Z0-9_-]+[^\s]*)/gi;
    const allUrlRegex = /(https?:\/\/[^\s]+)/gi;

    let folderMatches = input.match(gdriveFolderRegex) || [];
    let allMatches = input.match(allUrlRegex) || [];

    let uniqueFolders = [...new Set(folderMatches)];
    let uniqueAll = [...new Set(allMatches)];

    let result = [];
    if (uniqueFolders.length > 0) {
        uniqueFolders.forEach((folder, idx) => {
            result.push(`Folder Link ${idx + 1}:\n${folder}`);
        });
    }

    uniqueAll.forEach(link => {
        if (!gdriveFolderRegex.test(link) && !result.includes(link)) {
            result.push(link);
        }
    });

    outputArea.value = result.length ? result.join('\n\n') : "⚠️ No Google Drive links found!";
}

function sendToRawInput() {
    const data = document.getElementById('gdriveOutput').value;
    if (data) {
        document.getElementById('rawInput').value = data;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function clearGDrive() {
    document.getElementById('gdriveInput').value = '';
    document.getElementById('gdriveOutput').value = '';
}
