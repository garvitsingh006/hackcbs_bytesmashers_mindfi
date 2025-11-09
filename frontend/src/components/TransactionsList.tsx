import React from "react";

type Txn = {
  timestamp: string | Date;
  category: string;
  merchant?: string;
  amount: number;
  is_reckless: boolean;
  type?: string; // "debit"/"credit" if you have it
};

interface Props {
  title?: string;
  transactions: Txn[];
}

const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function TransactionsList({ title = "Recent Transactions", transactions }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-100 text-lg font-semibold">{title}</h3>
        <span className="text-xs text-slate-400">{transactions.length} items</span>
      </div>

      {/* Header */}
      <div className="grid grid-cols-12 px-3 py-2 text-xs font-medium text-slate-400">
        <span className="col-span-5">CATEGORY • MERCHANT</span>
        <span className="col-span-3">DATE</span>
        <span className="col-span-2 text-right">AMOUNT</span>
        <span className="col-span-2 text-right">STATUS</span>
      </div>
      <div className="h-px bg-slate-800 mb-1" />

      {/* Rows */}
      <ul className="divide-y divide-slate-800">
        {transactions.map((tx, i) => {
          const d = new Date(tx.timestamp);
          const dateStr = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
          const timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
          const label = tx.merchant ? `${tx.category} • ${tx.merchant}` : tx.category || "Unknown";

          return (
            <li
              key={i}
              className="grid grid-cols-12 items-center px-3 py-3 hover:bg-slate-850/50 rounded-lg transition"
            >
              {/* Category • Merchant */}
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    tx.is_reckless ? "bg-red-400" : "bg-green-400"
                  }`}
                />
                <span className="truncate text-slate-200">{label}</span>
              </div>

              {/* Date */}
              <div className="col-span-3 text-slate-400 text-sm">
                {dateStr} <span className="text-slate-500">• {timeStr}</span>
              </div>

              {/* Amount */}
              <div
                className={`col-span-2 text-right text-sm ${
                  tx.is_reckless ? "text-red-300" : "text-slate-200"
                }`}
              >
                {formatINR(Math.abs(tx.amount))}
              </div>

              {/* Status */}
              <div className="col-span-2 text-right">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    tx.is_reckless
                      ? "bg-red-500/10 text-red-300 border border-red-500/30"
                      : "bg-green-500/10 text-green-300 border border-green-500/30"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      tx.is_reckless ? "bg-red-400" : "bg-green-400"
                    }`}
                  />
                  {tx.is_reckless ? "Reckless" : "Normal"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Empty state */}
      {transactions.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm">No transactions yet.</div>
      )}
    </div>
  );
}
