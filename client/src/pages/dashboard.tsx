import Navigation from "@/components/navigation";
import Dashboard from "@/components/dashboard";
import Footer from "@/components/footer";

export default function DashboardPage() {
  return (
    <div className="bg-white">
      <Navigation />
      <Dashboard />
      <Footer />
    </div>
  );
}