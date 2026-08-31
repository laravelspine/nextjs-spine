const events = [
  ["SettingUpdated", "Setting dibuat/diubah", "SettingService::set()"],
  ["SmsSent", "SMS terkirim", "SmsService::send()"],
  ["NotificationSent", "Notifikasi realtime (Reverb)", "BroadcastController"],
  ["NotificationCreating", "Sebelum notifikasi; payload mutable", "BroadcastController"],
  ["MailSending", "Sebelum email; payload mutable", "MailService::send()"],
  ["MailTesting", "Sebelum test SMTP; payload mutable", "MailService::testSmtp()"],
  ["MailTested", "Setelah test SMTP (success/error)", "MailService::testSmtp()"],
  ["FileUploading", "Sebelum file disimpan; veto point", "FileService::storeUpload()"],
  ["FileUploaded", "Setelah file disimpan", "FileService::storeUpload()"],
  ["FileDeleting", "Sebelum file dihapus; veto point", "FileService::deleteUpload()"],
  ["FileDeleted", "Setelah file dihapus", "FileService::deleteUpload()"],
  ["PdfCreating", "Sebelum PDF dirender; payload mutable", "PdfService::fromHtml()/fromView()"],
  ["PdfCreated", "Setelah PDF dirender", "PdfService::fromHtml()/fromView()"],
  ["DateFormatting", "Saat format tanggal; payload mutable", "DateService::format()/toSql()"],
  ["RelationResolving", "Saat relasi di-resolve; payload mutable", "RelationService::resolve()"],
  ["ModuleInstalled", "Modul terinstall", "ModuleController::install()"],
  ["ModuleUninstalled", "Modul di-uninstall", "ModuleController::uninstall()"],
  ["ModuleActivated", "Modul diaktifkan", "ModuleController::enable()"],
  ["ModuleDeactivated", "Modul dinonaktifkan", "ModuleController::disable()"],
];

export default function HooksPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Registry Hook</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Semua titik ekstensi Spine memakai{" "}
          <code className="text-emerald-400">Laravel Events</code>. Listener
          didaftarkan lewat <code className="text-emerald-400">Event::listen()</code>{" "}
          di provider aplikasi/modul.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-2 font-medium">Event</th>
              <th className="px-4 py-2 font-medium">Kapan</th>
              <th className="px-4 py-2 font-medium">Dispatcher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {events.map(([name, when, from]) => (
              <tr key={name}>
                <td className="px-4 py-2 font-mono text-emerald-400">
                  Spine\Events\{name}
                </td>
                <td className="px-4 py-2 text-zinc-400">{when}</td>
                <td className="px-4 py-2 font-mono text-zinc-500">{from}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm">
        <h2 className="font-semibold text-emerald-400">Contoh listener</h2>
        <pre className="mt-2 overflow-x-auto text-xs text-zinc-400">{`// app/Providers/EventServiceProvider.php
use Spine\\Events\\PdfCreating;

public function boot(): void
{
    Event::listen(PdfCreating::class, function (PdfCreating $e) {
        $e->payload['html'] = str_replace('{{logo}}', logoUrl(), $e->payload['html']);
    });
}`}</pre>
      </div>
    </div>
  );
}
