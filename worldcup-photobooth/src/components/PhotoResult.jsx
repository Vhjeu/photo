import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Download, RefreshCw, Home, Palette } from 'lucide-react';

const FILTERS = [
    { id: 'normal', name: 'Normal', filter: 'none' },
    { id: 'cinematic', name: 'Cinematic', filter: 'contrast(1.2) saturate(1.2) brightness(0.9) sepia(0.2)' },
    { id: 'vintage', name: 'Vintage', filter: 'sepia(0.6) contrast(1.1) brightness(0.9) hue-rotate(-15deg)' },
    { id: 'bw', name: 'B&W', filter: 'grayscale(100%) contrast(1.2)' }
];

export default function PhotoResult({ image, team, onRetake, onHome }) {
    const canvasRef = useRef(null);

    // Xử lý dữ liệu nhận từ Camera
    const imageSrc = typeof image === 'object' ? image.src : image;
    const initialFilterCss = typeof image === 'object' ? image.filter : 'none';

    // Tự động chọn đúng Filter đã dùng lúc chụp
    const initialFilterObj = FILTERS.find(f => f.filter === initialFilterCss) || FILTERS[0];

    const [activeFilter, setActiveFilter] = useState(initialFilterObj);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        // Bắn pháo giấy chiến thắng
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: team.colors
        });

        // Play âm thanh cổ vũ
        const audio = new Audio('/crowd-cheer.mp3');
        audio.play().catch(() => { });

        drawCanvas();
    }, [imageSrc, team, activeFilter]);

    const drawCanvas = () => {
        setIsProcessing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Kích thước xuất ảnh chuẩn Instagram Portrait (4:5)
        const CANVAS_WIDTH = 1080;
        const CANVAS_HEIGHT = 1350;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // Hàm hỗ trợ tải ảnh dưới dạng Promise
        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image at ${src}`));
                img.src = src;
            });
        };

        // Hàm vẽ ảnh webcam lên canvas với filter (tương thích tốt hơn)
        const drawWebcamWithFilter = (ctx, img, filterCss, width, height) => {
            // Nếu trình duyệt hỗ trợ ctx.filter (Chrome, Edge)
            if (typeof ctx.filter !== 'undefined') {
                ctx.filter = filterCss;
                const scale = Math.max(width / img.width, height / img.height);
                const x = (width / 2) - (img.width / 2) * scale;
                const y = (height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                ctx.filter = 'none';
            } else {
                // Fallback: vẽ không filter (tất cả trình duyệt hỗ trợ)
                const scale = Math.max(width / img.width, height / img.height);
                const x = (width / 2) - (img.width / 2) * scale;
                const y = (height / 2) - (img.height / 2) * scale;
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            }
        };

        // Tải song song cả ảnh Camera và ảnh Frame PNG
        Promise.all([
            loadImage(imageSrc),
            loadImage(team.frameUrl).catch(() => null) // Cho phép frame fail
        ]).then(([webcamImg, frameImg]) => {

            // 1. Vẽ ảnh Camera nằm dưới cùng (Áp dụng bộ lọc)
            drawWebcamWithFilter(ctx, webcamImg, activeFilter.filter, CANVAS_WIDTH, CANVAS_HEIGHT);

            // 2. Vẽ đè Khung ảnh PNG thiết kế sẵn lên trên cùng (nếu có)
            if (frameImg) {
                ctx.drawImage(frameImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            }

            setIsProcessing(false);

        }).catch((error) => {
            console.error("Lỗi khi load ảnh:", error);
            // Fallback: chỉ vẽ ảnh webcam mà không frame
            loadImage(imageSrc).then((webcamImg) => {
                drawWebcamWithFilter(ctx, webcamImg, activeFilter.filter, CANVAS_WIDTH, CANVAS_HEIGHT);
                setIsProcessing(false);
            }).catch(() => setIsProcessing(false));
        });
    };

    const handleDownload = () => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        link.download = `worldcup-photo-${team.id}-${timestamp}.jpg`;
        link.href = dataUrl;
        link.click();
    };

    return (
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center md:items-start justify-center relative z-10 px-4">
            {/* Cột Preview ảnh đã chụp */}
            <div className="flex-1 w-full max-w-sm md:max-w-md relative">
                <div className="rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/20 bg-black">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-auto aspect-[4/5] object-cover block"
                    />
                </div>
                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-20">
                        <RefreshCw className="animate-spin text-white" size={40} />
                    </div>
                )}
            </div>

            {/* Cột Công cụ xử lý */}
            <div className="w-full md:w-80 flex flex-col gap-6 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 mt-6 md:mt-0">
                <div>
                    <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-4 flex items-center gap-2">
                        <Palette size={16} /> Bộ lọc màu
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {FILTERS.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setActiveFilter(f)}
                                className={`py-2 px-1 text-xs md:text-sm rounded-lg border transition-all ${activeFilter.id === f.id
                                    ? 'bg-wc-gold text-wc-blue border-wc-gold font-bold shadow-lg'
                                    : 'border-white/20 text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                {f.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[1px] w-full bg-white/10 my-1"></div>

                <button
                    onClick={handleDownload}
                    className="w-full py-4 bg-wc-gold text-wc-blue font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                    <Download size={20} /> TẢI ẢNH (JPG)
                </button>

                <div className="flex gap-3">
                    <button
                        onClick={onRetake}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all border border-white/10"
                    >
                        <RefreshCw size={18} /> Chụp lại
                    </button>
                    <button
                        onClick={onHome}
                        className="flex-1 py-3 bg-white/5 hover:bg-red-500/20 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all border border-transparent hover:border-red-500/30 text-gray-300 hover:text-red-400"
                    >
                        <Home size={18} /> Kết thúc
                    </button>
                </div>
            </div>
        </div>
    );
}