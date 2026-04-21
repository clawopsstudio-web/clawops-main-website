export default function CallbackLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#e8ff47]/10 border border-[#e8ff47]/30 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-[#e8ff47] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-white/40">Completing sign in...</p>
      </div>
    </div>
  )
}
