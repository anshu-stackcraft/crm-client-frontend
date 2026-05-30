import EcommerceMetrics from "./EcommerceMetrics";
import MonthlySalesChart from "./MonthlySalesChart";
import StatisticsChart from "./StatisticsChart";
import MonthlyTarget from "./MonthlyTarget";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Dashboard - CRM"
        description="Welcome to your CRM Dashboard! Here you can get a quick overview of your sales performance, customer interactions, and key metrics. Stay on top of your business with real-time insights and actionable data."
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

      </div>
    </>
  );
}
