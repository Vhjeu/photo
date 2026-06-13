import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { teams } from '../src/data/teams.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tạo thư mục frames nếu chưa tồn tại
const framesDir = path.join(__dirname, '..', 'public', 'images', 'frames');
if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
}

console.log(`📁 Frames directory: ${framesDir}\n`);
console.log('🎨 Generating frame PNGs for each team...\n');

// Hàm chuyển hex sang RGB
const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0,0,0';
    return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
};

// Tạo SVG frame cho từng team
const createFrameSvg = (team) => {
    const width = 1920;
    const height = 1080;
    const borderWidth = 50;  // Viền ngoài cùng

    const color1 = team.colors[0];
    const color2 = team.colors[1] || '#FFFFFF';

    // Frame PNG trong suốt, chỉ viền màu quanh cạnh
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
            </linearGradient>
        </defs>

        <!-- Nền trong suốt (toàn bộ canvas) -->
        <rect width="${width}" height="${height}" fill="rgba(0,0,0,0)"/>

        <!-- Viền trên (gradient) -->
        <rect x="0" y="0" width="${width}" height="${borderWidth}"
              fill="url(#grad1)"/>

        <!-- Viền dưới (gradient) -->
        <rect x="0" y="${height - borderWidth}" width="${width}" height="${borderWidth}"
              fill="url(#grad1)"/>

        <!-- Viền trái (solid color1) -->
        <rect x="0" y="${borderWidth}" width="${borderWidth}" height="${height - borderWidth * 2}"
              fill="${color1}"/>

        <!-- Viền phải (solid color2) -->
        <rect x="${width - borderWidth}" y="${borderWidth}" width="${borderWidth}" height="${height - borderWidth * 2}"
              fill="${color2}"/>

        <!-- Text: Slogan (góc trên trái) -->
        <text x="80" y="90"
              font-size="48" font-weight="bold" font-family="Arial, sans-serif"
              fill="${color2}" letter-spacing="1">
            ${team.slogan}
        </text>

        <!-- Text: Tên quốc gia (góc dưới trái) -->
        <text x="80" y="${height - 40}"
              font-size="44" font-weight="bold" font-family="Arial, sans-serif"
              fill="${color2}" letter-spacing="2">
            ${team.name.toUpperCase()}
        </text>
    </svg>
    `;

    return svg;
};

// Generate frame PNG cho mỗi team
(async () => {
    try {
        for (const team of teams) {
            const svg = createFrameSvg(team);
            const outputPath = path.join(framesDir, `frame-${team.id}.png`);

            await sharp(Buffer.from(svg))
                .png()
                .toFile(outputPath);

            console.log(`✅ frame-${team.id}.png (${team.name})`);
        }

        console.log('\n✨ Hoàn thành! Tất cả frame PNG đã được tạo (1920 × 1080)');
    } catch (err) {
        console.error('❌ Lỗi khi tạo frame:', err);
        process.exit(1);
    }
})();
