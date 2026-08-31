const groups = [
  {
    name: "Auth",
    endpoints: [
      ["POST", "/api/v1/auth/login", "Login email+password → Sanctum token (publik)"],
      ["POST", "/api/v1/auth/register", "Daftar user baru (publik)"],
      ["POST", "/api/v1/auth/logout", "Cabut token aktif"],
      ["GET", "/api/v1/auth/me", "User yang sedang login"],
    ],
  },
  {
    name: "Settings",
    endpoints: [
      ["GET", "/api/v1/settings/{key}", "Ambil satu setting"],
      ["PUT", "/api/v1/settings/{key}", "Upsert setting"],
      ["DELETE", "/api/v1/settings/{key}", "Hapus setting"],
      ["POST", "/api/v1/settings/bulk", "Upsert banyak sekaligus"],
    ],
  },
  {
    name: "Meta",
    endpoints: [
      ["GET", "/api/v1/meta/{type}/{id}", "Semua meta milik entity"],
      ["POST", "/api/v1/meta/{type}/{id}", "Set meta (kontrak {meta:{...}})"],
      ["GET", "/api/v1/meta/{type}/{id}/{key}", "Satu meta"],
      ["PUT", "/api/v1/meta/{type}/{id}/{key}", "Update satu meta"],
      ["DELETE", "/api/v1/meta/{type}/{id}/{key}", "Hapus satu meta"],
    ],
  },
  {
    name: "Files",
    endpoints: [
      ["POST", "/api/v1/files", "Upload (event FileUploading/FileUploaded)"],
      ["GET", "/api/v1/files/{id}", "Detail attachment"],
      ["GET", "/api/v1/files/{id}/download", "Download"],
      ["GET", "/api/v1/files/{id}/preview", "Preview inline"],
      ["DELETE", "/api/v1/files/{id}", "Hapus (event FileDeleting/FileDeleted)"],
      ["GET", "/api/v1/files/limits", "Batas upload dari php.ini"],
    ],
  },
  {
    name: "Tags",
    endpoints: [
      ["GET", "/api/v1/tags", "Daftar tag"],
      ["POST", "/api/v1/tags", "Buat tag"],
      ["DELETE", "/api/v1/tags/{id}", "Hapus tag"],
    ],
  },
  {
    name: "Mail / SMS",
    endpoints: [
      ["POST", "/api/v1/mail/send", "Kirim email (event MailSending)"],
      ["POST", "/api/v1/mail/test", "Test SMTP (event MailTesting/MailTested)"],
      ["POST", "/api/v1/sms/send", "Kirim SMS (event SmsSent)"],
    ],
  },
  {
    name: "Tools",
    endpoints: [
      ["POST", "/api/v1/qr-code/generate", "Generate QR (data URI)"],
      ["POST", "/api/v1/number-to-word/convert", "Angka → terbilang"],
      ["POST", "/api/v1/pdf/from-html", "HTML → PDF (event PdfCreating/PdfCreated)"],
      ["POST", "/api/v1/excel/export", "Export XLSX"],
    ],
  },
  {
    name: "Lainnya",
    endpoints: [
      ["GET", "/api/v1/activity-logs", "Activity log (REST)"],
      ["GET", "/api/v1/relations/{type}/{id}", "Resolve relasi (event RelationResolving)"],
      ["GET", "/api/v1/system/languages", "Daftar bahasa"],
      ["POST", "/api/v1/gdpr/export", "Export data subject"],
    ],
  },
];

export default function ApiPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Daftar Endpoint API</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Semua endpoint di bawah <code className="text-emerald-400">/api/v1</code>{" "}
          butuh header <code className="text-emerald-400">Authorization: Bearer &lt;token&gt;</code>{" "}
          kecuali login/register.
        </p>
      </header>

      {groups.map((g) => (
        <section key={g.name}>
          <h2 className="text-lg font-semibold text-emerald-400">{g.name}</h2>
          <div className="mt-3 overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-left text-zinc-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Method</th>
                  <th className="px-4 py-2 font-medium">Path</th>
                  <th className="px-4 py-2 font-medium">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {g.endpoints.map(([m, p, d]) => (
                  <tr key={m + p}>
                    <td className="px-4 py-2">
                      <span
                        className={
                          "rounded px-1.5 py-0.5 text-xs font-mono " +
                          (m === "GET"
                            ? "bg-blue-500/15 text-blue-400"
                            : m === "POST"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : m === "PUT"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-red-500/15 text-red-400")
                        }
                      >
                        {m}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-zinc-300">{p}</td>
                    <td className="px-4 py-2 text-zinc-500">{d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
