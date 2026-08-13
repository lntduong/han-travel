import Image from "next/image";

export function LockedState() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="text-center animate-pulse">
        <Image 
          src="/logo.png" 
          alt="Locked Logo" 
          width={120} 
          height={120} 
          className="mx-auto rounded-3xl opacity-50 grayscale" 
        />
        <p className="mt-6 text-slate-400 font-medium tracking-wide">
          Vui lòng đăng nhập để xem nội dung
        </p>
      </div>
    </div>
  );
}
