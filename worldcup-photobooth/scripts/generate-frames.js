import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { teams } from '../src/data/teams.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tạo thư mục frames nếu chưa tồn tại
const framesDir = path.join(__dirname, '..', 'public', 'images', 'frames');
if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
}

console.log(`📁 Frames directory: ${framesDir}`);

// Copy hoặc tạo frame cho mỗi đội
// Nếu frame-arg.png tồn tại, sao chép thành các frame khác
// Nếu không, tạo placeholder
const sourceFrame = path.join(framesDir, 'frame-arg.png');

if (fs.existsSync(sourceFrame)) {
    console.log('📦 Tìm thấy frame-arg.png, sao chép cho các đội khác...\n');
    teams.forEach((team) => {
        const targetFrame = path.join(framesDir, `frame-${team.id}.png`);
        if (!fs.existsSync(targetFrame)) {
            fs.copyFileSync(sourceFrame, targetFrame);
            console.log(`✅ Tạo: frame-${team.id}.png (${team.name})`);
        } else {
            console.log(`⏭️  Đã tồn tại: frame-${team.id}.png (${team.name})`);
        }
    });
    console.log('\n✨ Hoàn thành! Tất cả frame PNG đã sẵn sàng.');
} else {
    console.log('⚠️  Không tìm thấy frame-arg.png!');
    console.log('💡 Hãy cung cấp frame PNG mẫu tại: public/images/frames/frame-arg.png');
    console.log('   Sau đó chạy lại script này để sao chép cho các đội khác.');
    process.exit(1);
}
