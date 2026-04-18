import { useLoaderData } from "react-router-dom";
import { getHostIncome, getHostIncomeData } from "../../api";
import { requireAuth } from "../../utils";

export async function loader({ request }) {
  await requireAuth({ request });
  const income = await getHostIncome();
  const incomeData = await getHostIncomeData();
  return { income, incomeData };
}

export default function Income() {
  const { income, incomeData } = useLoaderData();
  const maxIncome = Math.max(...incomeData.chartData.map((d) => d.income));

  const chartBars = incomeData.chartData.map((data) => {
    const heightPercent = (data.income / maxIncome) * 100;
    const isCurrentMonth = data.month === incomeData.chartData.at(-1)?.month;

    return (
      <div key={data.month} className="income-bar-group">
        <div
          className={`income-bar-fill ${isCurrentMonth ? "current" : ""}`}
          style={{ height: `${heightPercent}%` }}
          role="meter"
          aria-label={`${data.month} income`}
          aria-valuemin={0}
          aria-valuemax={maxIncome}
          aria-valuenow={data.income}
        ></div>
        <span className="income-bar-label">{data.month}</span>
      </div>
    );
  });

  const transactions = incomeData.transactions.map((transaction) => (
    <div key={transaction.id} className="income-transaction-item">
      <span className="income-transaction-amount">${transaction.amount}</span>
      <span className="income-transaction-date">{transaction.date}</span>
    </div>
  ));

  return (
    <div className="income-container">
      <div className="income-header">
        <h1>Income</h1>
        <p className="income-period">Last 30 days</p>
        <p className="income-amount">${income.toLocaleString()}</p>
      </div>

      <div className="income-chart-container">
        <div className="income-chart-wrapper">
          <div className="income-chart-axis">
            <span>$5k</span>
            <span>$4k</span>
            <span>$3k</span>
            <span>$2k</span>
            <span>$1k</span>
            <span>$0</span>
          </div>
          <div className="income-chart">{chartBars}</div>
        </div>
      </div>

      <div className="income-transactions">
        <div className="income-transactions-header">
          <h2>Your transactions ({incomeData.transactions.length})</h2>
          <span className="income-transactions-link">Last 30 days</span>
        </div>
        <div>{transactions}</div>
      </div>
    </div>
  );
}
