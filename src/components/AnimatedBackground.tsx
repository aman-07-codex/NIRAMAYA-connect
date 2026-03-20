const AnimatedBackground = () => {
    return (
        <div className="absolute inset-0 z-[-1] overflow-hidden bg-slate-50">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-500/15 blur-[120px] animate-blob mix-blend-multiply" />
            <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-500/15 blur-[120px] animate-blob-reverse mix-blend-multiply" />
            <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-red-400/10 blur-[100px] animate-blob mix-blend-multiply" style={{ animationDelay: '2s' }} />
        </div>
    );
};

export default AnimatedBackground;
