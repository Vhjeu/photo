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

    const imageSrc = typeof image === 'object' ? image.src : image;
    const initialFilterCss = typeof image === 'object' ? image.filter : 'none';

    const initialFilterObj = FILTERS.find(f => f.filter === initialFilterCss) || FILTERS[0];

    const [activeFilter, setActiveFilter] = useState(initialFilterObj);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 },
            colors: team.colors
        });

        const audio = new Audio('/crowd-cheer.mp3');
        audio.play().catch(() => { });

        drawCanvas();
    }, [imageSrc, team, activeFilter]);

    const drawCanvas = () => {
        setIsProcessing(true);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Đã đổi sang kích thước 16:9 (Ngang)
        const CANVAS_WIDTH = 1920;
        const CANVAS_HEIGHT = 1080;
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image at ${src}`));
                img.src = src;
            });
        };

        Promise.all([
            loadImage(imageSrc),
            loadImage(team.frameUrl)
        ]).then(([webcamImg, frameImg]) => {

            ctx.filter = activeFilter.filter;
            const scale = Math.max(CANVAS_WIDTH / webcamImg.width, CANVAS_HEIGHT / webcamImg.height);
            const x = (CANVAS_WIDTH / 2) - (webcamImg.width / 2) * scale;
            const y = (CANVAS_HEIGHT / 2) - (webcamImg.height / 2) * scale;
            ctx.drawImage(webcamImg, x, y, webcamImg.width * scale, webcamImg.height * scale);
            ctx.filter = 'none';

            ctx.drawImage(frameImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            setIsProcessing(false);

        }).catch((error) => {
            console.error("Lỗi khi load frame PNG:", error);
            loadImage(imageSrc).then((webcamImg) => {
                ctx.filter = activeFilter.filter;
                const scale = Math.max(CANVAS_WIDTH / webcamImg.width, CANVAS_HEIGHT / webcamImg.height);
                const x = (CANVAS_WIDTH / 2) - (webcamImg.width / 2) * scale;
                const y = (CANVAS_HEIGHT / 2) - (webcamImg.height / 2) * scale;
                ctx.drawImage(webcamImg, x, y, webcamImg.width * scale, webcamImg.height * scale);
                ctx.filter = 'none';
                setIsProcessing(false);
            });
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
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center relative z-10 px-4">
            {/* Cột Preview ảnh ngang */}
            <div className="flex-1 w-full max-w-4xl relative">
                <div className="rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/20 bg-black">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-auto aspect-video object-cover block"
                    />
                </div>
                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-20">
                        <RefreshCw className="animate-spin text-white" size={40} />
                    </div>
                )}
            </div>

            {/* Cột Công cụ xử lý */}
            <div className="w-full lg:w-80 flex flex-col gap-6 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 mt-6 lg:mt-0 shrink-0">
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