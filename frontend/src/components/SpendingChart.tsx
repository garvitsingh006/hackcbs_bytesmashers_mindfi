import SpendingChartImg from "../assets/charts/spending-chart.jpg";

export default function SpendingChartStatic() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full">
      {/* <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-100 text-lg font-semibold">Spending Trend</h3>

      </div> */}

      {/* Image container */}
      <div className="w-full rounded-xl overflow-hidden flex items-center justify-center">
  <img 
    src={SpendingChartImg} 
    alt="Spending Trend Graph"
    className="max-w-full h-auto object-contain"
  />
</div>

    </div>
  );
}
