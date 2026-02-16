"use client";

import { Shell } from "@/components/Shell";
import { Button, Card, H1, Select } from "@/components/ui";
import { useEffect, useMemo, useState } from "react";
import { brl } from "@/lib/format";

type Row = { categoria: string; total: number };

export default function RelatoriosPage() {
  const [obras, setObras] = useState<{ id: string; nome: string }[]>([]);
  const [obraId, setObraId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch("/api/obras-lite").then(r => r.json()).then(j => setObras(j.obras));
  }, []);

  async function load() {
    const qs = obraId ? `?obraId=${encodeURIComponent(obraId)}` : "";
    const j = await fetch(`/api/relatorios/despesas-por-categoria${qs}`).then(r => r.json());
    setRows(j.rows ?? []);
  }

  useEffect(() => { load(); }, [obraId]);

  const total = useMemo(() => rows.reduce((a,b) => a + (b.total || 0), 0), [rows]);

  function exportCSV() {
    const header = "categoria,total\n";
    const body = rows.map(r => `${JSON.stringify(r.categoria)},${r.total}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `despesas-por-categoria${obraId ? "-obra" : ""}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Shell>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <H1>Relatórios</H1>
        <Button variant="secondary" onClick={exportCSV}>Exportar CSV</Button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <Card className="md:col-span-1">
          <div className="font-semibold mb-2">Filtros</div>
          <div className="text-sm text-zinc-600 mb-1">Obra</div>
          <Select value={obraId} onChange={(e) => setObraId(e.target.value)}>
            <option value="">Todas</option>
            {obras.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
          </Select>
          <div className="text-xs text-zinc-500 mt-2">No MVP inicial, o relatório não filtra por período.</div>
        </Card>

        <Card className="md:col-span-2 overflow-auto">
          <div className="font-semibold mb-2">Despesas por categoria</div>
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-600">
              <tr className="border-b">
                <th className="py-2">Categoria</th>
                <th>Total</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pct = total > 0 ? (r.total / total) * 100 : 0;
                return (
                  <tr key={r.categoria} className="border-b last:border-b-0">
                    <td className="py-2">{r.categoria}</td>
                    <td>{brl(r.total)}</td>
                    <td>{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
              <tr className="border-t">
                <td className="py-2 font-semibold">Total</td>
                <td className="font-semibold">{brl(total)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </Shell>
  );
}
