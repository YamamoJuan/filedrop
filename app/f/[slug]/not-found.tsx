export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="glass rounded-2xl p-10 text-center space-y-4 max-w-sm w-full">
        <div className="text-5xl">🔍</div>
        <h1 className="text-2xl font-bold text-white">File Tidak Ditemukan</h1>
        <p className="text-slate-400 text-sm">Link ini sudah tidak valid atau file sudah dihapus.</p>
        <a href="/" className="inline-block mt-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 transition-colors rounded-xl text-sm font-semibold text-white">Kembali ke Home</a>
      </div>
    </main>
  );
}
