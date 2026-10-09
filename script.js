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

// Clean Copy Handler without annoying browser popup
function copyOutput() {
    const text = document.getElementById('output').value;
    const copyBtn = document.querySelector('.btn-copy');

    if (text) {
        navigator.clipboard.writeText(text);

        if (copyBtn) {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ COPIED TO CLIPBOARD!';
            copyBtn.style.background = 'linear-gradient(135deg, #15803d 0%, #166534 100%)';

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }
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

// Robust Clean Title Logic: Strips "My Files:", Timestamps, and handles Year
function cleanTitle(filename) {
    if (!filename) return { baseName: "pack files", displayName: "pack files", year: null };

    // Remove "My Files:" prefix and any timestamp logs like [10/8/2026 ...]
    let clean = filename
        .replace(/^.*?My Files:\s*/i, '')
        .replace(/^\[.*?\]\s*/i, '')
        .trim();

    const yearMatch = clean.match(/(?:19|20)\d{2}/);
    let yearStr = yearMatch ? ` (${yearMatch[0]})` : "";

    let titlePart = clean;
    if (yearMatch) {
        titlePart = clean.split(/(?:19|20)\d{2}/i)[0];
    } else if (/S\d{2}/i.test(clean)) {
        titlePart = clean.split(/S\d{2}/i)[0];
    }

    let cleanName = titlePart
        .split(/AKA/i)[0]
        .replace(/[\.\_]/g, ' ')
        .replace(/[\-\(\)\[\]]+$/, '')
        .trim();

    if (!cleanName) cleanName = "Show";

    return {
        baseName: cleanName.toLowerCase(),
        displayName: `${cleanName}${yearStr}`,
        year: yearMatch ? yearMatch[0] : null
    };
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

    // Comprehensive OTT & Source Tag Detection
    let source = "";
    if (/REMUX/i.test(filename)) {
        source = "BluRay • REMUX";
    } else if (/BluRay|BDRip|BRRip/i.test(filename)) {
        source = "BluRay";
    } else if (/(?:\b|\.)CR(?:UNCHYROLL)?(?:\b|\.)/i.test(filename)) {
        source = "CR";
    } else if (/(?:\b|\.)SONY(?:LIV)?(?:\b|\.)/i.test(filename)) {
        source = "SONY";
    } else if (/(?:\b|\.)iT(?:UNES)?(?:\b|\.)/i.test(filename)) {
        source = "iT";
    } else if (/(?:\b|\.)IQIYI|\bIQ\b/i.test(filename)) {
        source = "iQIYI";
    } else if (/(?:\b|\.)BILI(?:BILIBILI)?(?:\b|\.)/i.test(filename)) {
        source = "BILI";
    } else if (/(?:\b|\.)ZEE5(?:\b|\.)/i.test(filename)) {
        source = "ZEE5";
    } else if (/(?:\b|\.)NF|NETFLIX(?:\b|\.)/i.test(filename)) {
        source = "NF";
    } else if (/(?:\b|\.)AMZN|AMAZON(?:\b|\.)/i.test(filename)) {
        source = "AMZN";
    } else if (/(?:\b|\.)DSNP|DISNEY|HOTSTAR|\bHS\b(?:\b|\.)/i.test(filename)) {
        source = "DSNP";
    } else if (/(?:\b|\.)ATVP|APPLE(?:\b|\.)/i.test(filename)) {
        source = "ATVP";
    } else if (/(?:\b|\.)MAX|HBOMAX|HBO(?:\b|\.)/i.test(filename)) {
        source = "MAX";
    } else if (/(?:\b|\.)HULU(?:\b|\.)/i.test(filename)) {
        source = "HULU";
    } else if (/(?:\b|\.)VOOT(?:\b|\.)/i.test(filename)) {
        source = "VOOT";
    } else if (/(?:\b|\.)JIO(?:CINEMA)?(?:\b|\.)/i.test(filename)) {
        source = "JIO";
    } else if (/(?:\b|\.)AHA(?:\b|\.)/i.test(filename)) {
        source = "AHA";
    } else if (/(?:\b|\.)PMTP|PARAMOUNT(?:\b|\.)/i.test(filename)) {
        source = "PMTP";
    } else if (/(?:\b|\.)PCOK|PEACOCK(?:\b|\.)/i.test(filename)) {
        source = "PCOK";
    } else if (/(?:\b|\.)STAN(?:\b|\.)/i.test(filename)) {
        source = "STAN";
    } else if (/(?:\b|\.)TVER(?:\b|\.)/i.test(filename)) {
        source = "TVER";
    } else if (/(?:\b|\.)HOICHOI(?:\b|\.)/i.test(filename)) {
        source = "HOICHOI";
    } else if (/(?:\b|\.)KLICK(?:\b|\.)/i.test(filename)) {
        source = "KLICK";
    } else if (/(?:\b|\.)U-?NEXT(?:\b|\.)/i.test(filename)) {
        source = "U-NEXT";
    } else if (/(?:\b|\.)MA(?:\b|\.)/i.test(filename) && !/DTS/i.test(filename)) {
        source = "MA";
    } else {
        source = "AMZN";
    }

    let resBitHdrCodec = [res, bit, hdr, codec].filter(Boolean).join(" ");

    // PACK File Logic
    let isPack = /pack/i.test(filename) || /pack/i.test(url);
    if (isPack) {
        let packSize = totalAvcPackSizeGB > 0 ? ` [${totalAvcPackSizeGB.toFixed(2)} GB]` : sizeStr;
        return `${resBitHdrCodec} • ${source}${packSize} [PACK]`.replace(/\s+/g, ' ').trim();
    }

    // Normal Download Links
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

    let isEpisodeSeries = entries.some(e => /S\d{2}E\d{2}|S\d{2}|E\d{2}/i.test(e.file));
    let resultOutput = "";

    if (isEpisodeSeries) {
        let epGroups = {};

        entries.forEach(item => {
            let epMatch = item.file.match(/S\d{2}E\d{2}|S\d{2}/i);
            let epKey = epMatch ? epMatch[0].toUpperCase() : "GENERAL";
            let titleObj = cleanTitle(item.file);

            // Normalized Base Key ensures "Take Charge of My Heart" & "Take Charge of My Heart (2026)" merge into ONE block!
            let uniqueKey = `${titleObj.baseName}___${epKey}`;

            if (!epGroups[uniqueKey]) {
                epGroups[uniqueKey] = {
                    title: titleObj.displayName,
                    hasYear: !!titleObj.year,
                    epKey: epKey,
                    items: []
                };
            } else {
                // If year is found in any entry, ensure output header gets the year
                if (!epGroups[uniqueKey].hasYear && titleObj.year) {
                    epGroups[uniqueKey].title = titleObj.displayName;
                    epGroups[uniqueKey].hasYear = true;
                }
            }
            epGroups[uniqueKey].items.push(item);
        });

        let epOutputs = [];
        for (let groupKey in epGroups) {
            let group = epGroups[groupKey];

            let block = `\`${group.title} -${group.epKey}\`\n\n\``;
            group.items.forEach(it => {
                let label = parseFilename(it.file, it.url, totalAvcSizeGB);
                block += `${it.url} "${label}"\n`;
            });
            block = block.trim() + '`';
            epOutputs.push(block);
        }
        resultOutput = epOutputs.join('\n\n---\n\n');

    } else {
        let mainTitleObj = entries.length > 0 ? cleanTitle(entries[0].file) : { displayName: "pack files" };
        resultOutput = `\`${mainTitleObj.displayName} -GENERAL\`\n\n\``;

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
