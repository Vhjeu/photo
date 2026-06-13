import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, SwitchCamera, ChevronLeft, Sparkles, Settings2 } from 'lucide-react';

const FILTERS = [
    { id: 'normal', name: 'Normal', css: 'none' },
    { id: 'cinematic', name: 'Cinematic', css: 'contrast(1.2) saturate(1.2) brightness(0.9) sepia(0.2)' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(0.6) contrast(1.1) brightness(0.9) hue-rotate(-15deg)' },
    { id: 'bw', name: 'B&W', css: 'grayscale(100%) contrast(1.2)' }
];

const EFFECTS = [
    { id: 'none', name: 'Không' },
    { id: 'stadium', name: 'Đèn Sân Vận Động' },
    { id: 'led', name: 'Đèn LED Cổ Động' },
    { id: 'confetti', name: 'Pháo Giấy' }
];

export default function CameraBooth({ team, onCapture, onBack }) {
    const webcamRef = useRef(null);
    const [facingMode, setFacingMode] = useState("user");
    const [flash, setFlash] = useState(false);
    const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
    const [activeEffect, setActiveEffect] = useState(EFFECTS[0].id);

    // Hiệu ứng pháo giấy giả lập bằng CSS để xem trước
    const [confettiDrops, setConfettiDrops] = useState([]);

    useEffect(() => {
        if (activeEffect === 'confetti') {
            const drops = Array.from({ length: 30 }).map((_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 2 + 1}s`,
                animationDelay: `${Math.random() * 2}s`,
                color: Math.random() > 0.5 ? team.colors[0] : (team.colors[1] || '#FFF')
            }));
            setConfettiDrops(drops);
        } else {
            setConfettiDrops([]);
        }
    }, [activeEffect, team.colors]);

    const capture = useCallback(() => {
        setFlash(true);
        const audio = new Audio('/camera-shutter.mp3');
        audio.play().catch(() => { });

        setTimeout(() => {
            // Lấy ảnh gốc từ webcam
            const imageSrc = webcamRef.current.getScreenshot();

            // Chuyển ảnh cùng các thông số filter sang bước PhotoResult
            onCapture({
                src: imageSrc,
                filter: activeFilter.css,
                effect: activeEffect
            });
            setFlash(false);
        }, 150);
    }, [webcamRef, onCapture, activeFilter, activeEffect]);

    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? { exact: "environment" } : "user");
    };

    return (
        <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 items-center md:items-start justify-center relative z-10 px-4">

            {/* --- CỘT TRÁI: CAMERA VIEW (Tỉ lệ 4:5 chuẩn Photo Booth) --- */}
            <div className="flex-1 w-full max-w-sm md:max-w-md flex flex-col">
                <button onClick={onBack} className="self-start flex items-center gap-2 mb-4 text-gray-400 hover:text-white transition">
                    <ChevronLeft size={20} /> Đổi đội tuyển
                </button>

                <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black w-full aspect-[4/5] flex-shrink-0 group">

                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode, aspectRatio: 4 / 5 }}
                        style={{ filter: activeFilter.css }}
                        className="w-full h-full object-cover transition-all duration-300"
                        mirrored={facingMode === "user"}
                    />

                    {/* --- LIVE PREVIEW: KHUNG ẢNH PNG TỪ THƯ MỤC --- */}
                    <div className="absolute inset-0 pointer-events-none z-30 flex items-center justify-center">
                        <img
                            src={team.frameUrl}
                            alt={`Khung ảnh ${team.name}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                // Nếu chưa có file PNG, ẩn ảnh đi để không bị lỗi icon hỏng
                                e.target.style.display = 'none';
                            }}
                        />
                    </div>

                    {/* --- LIVE PREVIEW: HIỆU ỨNG (EFFECTS) --- */}
                    {activeEffect === 'stadium' && (
                        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/30 to-transparent z-20 pointer-events-none flex justify-around px-4">
                            <div className="w-20 h-20 bg-white/40 blur-2xl rounded-full -mt-10"></div>
                            <div className="w-20 h-20 bg-white/40 blur-2xl rounded-full -mt-10"></div>
                        </div>
                    )}

                    {activeEffect === 'led' && (
                        <div className="absolute bottom-[80px] left-[20px] right-[20px] h-[4px] z-20 shadow-[0_0_15px_#fff]" style={{ backgroundColor: team.colors[0], boxShadow: `0 0 20px ${team.colors[0]}` }}></div>
                    )}

                    {activeEffect === 'confetti' && (
                        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                            {confettiDrops.map((drop) => (
                                <div
                                    key={drop.id}
                                    className="absolute top-[-10px] w-2 h-4 rounded-sm animate-fall"
                                    style={{
                                        left: drop.left,
                                        backgroundColor: drop.color,
                                        animationDuration: drop.animationDuration,
                                        animationDelay: drop.animationDelay,
                                        animationIterationCount: 'infinite'
                                    }}
                                ></div>
                            ))}
                        </div>
                    )}

                    {/* Flash Effect */}
                    {flash && <div className="absolute inset-0 bg-white z-50"></div>}
                </div>
            </div>

            {/* --- CỘT PHẢI: BẢNG ĐIỀU KHIỂN (CONTROLS) --- */}
            <div className="w-full md:w-80 flex flex-col gap-6 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 mt-10 md:mt-12">

                {/* Bộ lọc màu */}
                <div>
                    <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-3 flex items-center gap-2">
                        <Settings2 size={16} /> Bộ lọc màu
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

                {/* Hiệu ứng đặc biệt */}
                <div>
                    <h3 className="text-sm uppercase tracking-widest text-gray-400 font-bold mb-3 flex items-center gap-2">
                        <Sparkles size={16} /> Hiệu ứng
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {EFFECTS.map(e => (
                            <button
                                key={e.id}
                                onClick={() => setActiveEffect(e.id)}
                                className={`py-2 px-1 text-xs md:text-sm rounded-lg border transition-all ${activeEffect === e.id
                                    ? 'bg-white text-black border-white font-bold'
                                    : 'border-white/20 text-gray-300 hover:bg-white/10'
                                    }`}
                            >
                                {e.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-[1px] w-full bg-white/10 my-2"></div>

                {/* Cụm nút Chụp & Đổi Camera */}
                <div className="flex items-center justify-center gap-6">
                    <button
                        onClick={toggleCamera}
                        className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all shadow-md md:hidden"
                    >
                        <SwitchCamera size={24} />
                    </button>

                    <button
                        onClick={capture}
                        className="group relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-wc-gold flex items-center justify-center border-4 border-white/30 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)]"
                    >
                        <div className="absolute inset-1 rounded-full border-2 border-dashed border-wc-blue/30 group-hover:rotate-180 transition-transform duration-700"></div>
                        <Camera size={36} className="text-wc-blue relative z-10" />
                    </button>
                </div>

            </div>
        </div>
    );
}