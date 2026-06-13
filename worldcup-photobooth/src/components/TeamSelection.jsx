import { motion } from 'framer-motion';
import { teams } from '../data/teams';
import { ChevronLeft, Trophy } from 'lucide-react';

export default function TeamSelection({ onSelect, onBack }) {
    return (
        <div className="w-full max-w-6xl relative z-10 px-4">
            {/* Thanh Header */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 w-full md:w-auto justify-center"
                >
                    <ChevronLeft size={20} /> Quay lại
                </button>

                <div className="flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-wc-gold via-yellow-200 to-wc-gold uppercase tracking-wider drop-shadow-lg flex items-center gap-3">
                        <Trophy className="text-wc-gold" size={40} />
                        Hành Trình World Cup 2026
                    </h2>
                    <p className="text-gray-300 mt-2 text-lg font-medium tracking-wide">Lựa chọn đội tuyển đồng hành cùng bạn</p>
                </div>

                <div className="hidden md:block w-[100px]"></div>
            </div>

            {/* Lưới Thể hiện Đội Tuyển */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-10">
                {teams.map((team, index) => (
                    <motion.div
                        key={team.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03, duration: 0.3 }}
                        onClick={() => onSelect(team)}
                        // Tối ưu class: dùng hover thuần của Tailwind, thêm will-change-transform
                        className="relative cursor-pointer rounded-2xl overflow-hidden border border-white/10 bg-[#0a192f]/95 hover:-translate-y-1 hover:scale-[1.02] hover:border-wc-gold/60 transition-transform duration-200 ease-out group shadow-lg will-change-transform"
                    >
                        {/* Hiệu ứng nền tĩnh, chỉ đổi opacity khi hover để tránh repaint nặng */}
                        <div
                            className="absolute inset-0 opacity-10 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"
                            style={{
                                background: `linear-gradient(135deg, ${team.colors[0]} 0%, transparent 100%)`
                            }}
                        ></div>

                        {/* Nội dung Card */}
                        <div className="relative p-6 flex flex-col items-center justify-center min-h-[220px]">

                            {/* Vòng tròn bọc Quốc kỳ */}
                            <div className="relative w-28 h-28 mb-3 rounded-full p-1 bg-white/5 border border-white/20 group-hover:border-wc-gold/50 transition-colors duration-200 z-10 flex items-center justify-center">
                                <div className="w-full h-full rounded-full overflow-hidden bg-black/40">
                                    <img
                                        src={team.flagUrl}
                                        alt={`Cờ ${team.name}`}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = `https://via.placeholder.com/150/${team.colors[0].replace('#', '')}/FFFFFF?text=${team.name.substring(0, 2)}`;
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Vùng chứa Tên đội & Nút chọn (Xử lý không bị đè chữ) */}
                            <div className="mt-2 flex flex-col items-center justify-center h-[50px] relative w-full">

                                {/* Tên đội - Sẽ trượt lên trên khi hover */}
                                <h3 className="font-black text-xl md:text-2xl text-white uppercase tracking-wider text-center transition-all duration-300 group-hover:-translate-y-3">
                                    {team.name}
                                </h3>

                                {/* Nút chọn - Sẽ trượt từ dưới lên và hiện ra phía dưới tên */}
                                <div className="absolute bottom-0 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                                    <span className="bg-wc-gold text-[#0a192f] text-[10px] md:text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-md">
                                        Chọn Đội
                                    </span>
                                </div>

                            </div>

                        </div>

                        {/* Viền màu trên cùng */}
                        <div
                            className="absolute top-0 left-0 h-1 w-full opacity-50 group-hover:opacity-100 transition-opacity duration-200"
                            style={{ backgroundColor: team.colors[0] }}
                        ></div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}