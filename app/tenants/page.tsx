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
        <p className="mt-2 text-sm text-zinc-400">
          Spine mengisolasi data per tenant dengan kolom{" "}
          <code className="text-emerald-400">tenant_id</code> yang nullable —
          <code className="text-emerald-400">null</code> berarti data global/platform.
        </p>
      </header>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 text-left text-zinc-500">
            <tr>
              <th className="px-4 py-2 font-medium">Entitas</th>
              <th className="px-4 py-2 font-medium">Isolasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {layers.map(([name, desc]) => (
              <tr key={name}>
                <td className="px-4 py-3 font-mono text-emerald-400">{name}</td>
                <td className="px-4 py-3 text-zinc-400">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm">
        <h2 className="font-semibold text-emerald-400">Path penyimpanan file</h2>
        <pre className="mt-2 overflow-x-auto text-xs text-zinc-400">
          {`tenants/{tenant_id}/{rel_type}/{rel_id}/{filename}
tenants/global/{rel_type}/{rel_id}/{filename}   // tenant_id null`}
        </pre>
      </div>
    </div>
  );
}
