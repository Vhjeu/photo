import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

export default function Home({ onStart }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center glass-panel p-12 rounded-3xl max-w-2xl w-full"
        >
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-6xl mb-6"
            >
                ⚽
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-wc-gold to-yellow-200 mb-4 tracking-tighter">
                WORLD CUP
                <br />PHOTO BOOTH
            </h1>
            <p className="text-gray-300 text-lg mb-10">Lưu giữ khoảnh khắc cùng đội tuyển yêu thích của bạn!</p>

            <button
                onClick={onStart}
                className="group relative px-8 py-4 bg-wc-gold text-wc-blue font-bold text-xl rounded-full overflow-hidden hover:scale-105 transition-transform flex items-center justify-center mx-auto gap-3"
            >
                <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:scale-110 transition-transform"></span>
                <Camera size={28} />
                BẮT ĐẦU CHỤP ẢNH
            </button>
        </motion.div>
    );
}