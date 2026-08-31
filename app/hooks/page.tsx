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
        <p className="mt-2 text-sm text-ink-muted">
          Semua titik ekstensi Spine memakai{" "}
          <code className="text-accent-strong">Laravel Events</code>. Listener
          didaftarkan lewat <code className="text-accent-strong">Event::listen()</code>{" "}
          di provider aplikasi/modul.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-line-soft">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised text-left text-ink-faint">
            <tr>
              <th className="px-4 py-2 font-medium">Event</th>
              <th className="px-4 py-2 font-medium">Kapan</th>
              <th className="px-4 py-2 font-medium">Dispatcher</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {events.map(([name, when, from]) => (
              <tr key={name}>
                <td className="px-4 py-2 font-mono text-accent-strong">
                  Spine\Events\{name}
                </td>
                <td className="px-4 py-2 text-ink-muted">{when}</td>
                <td className="px-4 py-2 font-mono text-ink-faint">{from}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-line-soft bg-surface-raised p-4 text-sm">
        <h2 className="font-semibold text-accent-strong">Contoh listener</h2>
        <pre className="mt-2 overflow-x-auto text-xs text-ink-muted">{`// app/Providers/EventServiceProvider.php
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
