export default function CallbackLoading() {
  return (
    <div className="min-h-screen bg-[#04040c] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-white/40">Completing sign in...</p>
      </div>
    </div>
  )
}
