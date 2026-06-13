import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="fixed inset-0 stars-bg opacity-40 pointer-events-none" />
      <div className="relative z-10 text-center">
        <div className="text-6xl mb-6 animate-float">🌑</div>
        <h1 className="font-cinzel font-black text-3xl gold-text mb-2">Lost in the Void</h1>
        <p className="text-oracle-light/50 mb-8">This spirit could not be found.</p>
        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl font-cinzel font-semibold text-sm tracking-wider"
          style={{
            background: 'linear-gradient(135deg, rgba(123,47,190,0.4), rgba(45,27,105,0.6))',
            border: '1px solid rgba(123,47,190,0.5)',
            color: '#E8D5A3',
          }}
        >
          Return to the Light →
        </Link>
      </div>
    </main>
  );
}
