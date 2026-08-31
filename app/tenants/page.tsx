const layers = [
  ["Tenant", "Unit bisnis terisolasi (id integer, null = global/platform)"],
  ["Setting", "tenant_id nullable — nilai per-tenant atau global"],
  ["Meta", "meta_type/meta_id — data kunci-nilai melekat ke entity mana pun"],
  ["Attachment", "rel_type/rel_id/tenant_id + disk — file terisolasi per tenant"],
  ["ActivityLog", "causer_id/subject_type/subject_id — jejak audit"],
];

export default function TenantsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Model Multi-tenant</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Spine mengisolasi data per tenant dengan kolom{" "}
          <code className="text-accent-strong">tenant_id</code> yang nullable —
          <code className="text-accent-strong">null</code> berarti data global/platform.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-line-soft">
        <table className="w-full text-sm">
          <thead className="bg-surface-raised text-left text-ink-faint">
            <tr>
              <th className="px-4 py-2 font-medium">Entitas</th>
              <th className="px-4 py-2 font-medium">Isolasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {layers.map(([name, desc]) => (
              <tr key={name}>
                <td className="px-4 py-3 font-mono text-accent-strong">{name}</td>
                <td className="px-4 py-3 text-ink-muted">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-line-soft bg-surface-raised p-4 text-sm">
        <h2 className="font-semibold text-accent-strong">Path penyimpanan file</h2>
        <pre className="mt-2 overflow-x-auto text-xs text-ink-muted">
          {`tenants/{tenant_id}/{rel_type}/{rel_id}/{filename}
tenants/global/{rel_type}/{rel_id}/{filename}   // tenant_id null`}
        </pre>
      </div>
    </div>
  );
}
