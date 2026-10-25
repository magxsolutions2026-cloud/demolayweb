export default function AdminLogin() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-maroon/80 via-[#2e1a32] to-black p-4">
      <div className="glass w-full max-w-2xl border border-gold/30 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-extrabold text-gold mb-2">Launch the Admin Portal</h1>
        <p className="text-foreground/80 mb-6">
          Use the <strong>Admin</strong> button at top-right of the site header for styled modal login.
          The panel fits the landing page theme and includes production-level transitions.
        </p>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-gold/20">
          <h2 className="text-2xl font-semibold text-white mb-3">What to do</h2>
          <ul className="list-disc list-inside text-foreground/80 space-y-2">
            <li>Click Admin (button in navbar)</li>
            <li>Type credentials (admin + AdminPassword1!)</li>
            <li>Submit and land at <code>/admin/dashboard</code></li>
          </ul>
        </div>

        <p className="text-sm text-foreground/70 mt-6">
          If the modal does not appear, make sure JavaScript is enabled and your browser has no modal blocker extensions.
        </p>
      </div>
    </main>
  );
}
