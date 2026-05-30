import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { PencilIcon, TrashBinIcon, PlusIcon } from "../../icons";

interface Client {
  id: number;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  service_type: "Web Development" | "App Development" | "CRM Integration" | "Consulting";
  project_status: "Lead" | "Proposal" | "Active" | "Completed" | "On Hold";
  budget: number;
  created_at: string;
}

interface Analytics {
  total_clients: number;
  total_budget: number;
  avg_budget: number;
  status_distribution: {
    Lead: number;
    Proposal: number;
    Active: number;
    Completed: number;
    "On Hold": number;
  };
  service_distribution: Array<{
    service_type: string;
    count: number;
    total_budget: number;
  }>;
  growth_history: Array<{
    month: string;
    count: number;
  }>;
}

const API_BASE = "http://127.0.0.1:8000/api/clients/";

export default function Clients() {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    service_type: "Web Development",
    project_status: "Lead",
    budget: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchClientsAndAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch directly from Django API endpoints
      const [listRes, analyticsRes] = await Promise.all([
        fetch(API_BASE),
        fetch(`${API_BASE}analytics/`),
      ]);

      if (!listRes.ok || !analyticsRes.ok) {
        throw new Error("Server returned an invalid response.");
      }

      const listData = await listRes.json();
      const analyticsData = await analyticsRes.json();

      setClients(listData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error("Failed to connect to Django API:", err);
      setError("Django Backend Offline: Could not establish a connection to the server database. Please make sure your Django server is running (python manage.py runserver).");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsAndAnalytics();
  }, []);

  const handleOpenEditModal = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      company_name: client.company_name,
      email: client.email,
      phone: client.phone || "",
      service_type: client.service_type,
      project_status: client.project_status,
      budget: client.budget.toString(),
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name || !formData.company_name || !formData.email) {
      setFormError("Contact Name, Company Name, and Email are required.");
      return;
    }

    const payload = {
      ...formData,
      budget: parseFloat(formData.budget) || 0.0,
    };

    try {
      const response = await fetch(`${API_BASE}${selectedClient?.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update client record in the database.");
      }

      setIsEditModalOpen(false);
      fetchClientsAndAnalytics();
    } catch (err: any) {
      setFormError(err.message || "An error occurred while saving.");
    }
  };

  const handleDeleteClient = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      const response = await fetch(`${API_BASE}${id}/`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete client from database.");
      }

      fetchClientsAndAnalytics();
    } catch (err: any) {
      alert(err.message || "Could not complete delete operation.");
    }
  };

  // Setup ApexCharts options and series
  const getServiceShareOptions = (): { options: ApexOptions; series: number[]; labels: string[] } => {
    if (!analytics) return { options: {}, series: [], labels: [] };

    const labels = analytics.service_distribution.map((item) => item.service_type);
    const series = analytics.service_distribution.map((item) => item.total_budget);

    const options: ApexOptions = {
      chart: {
        type: "donut",
        fontFamily: "Outfit, sans-serif",
      },
      labels,
      colors: ["#465fff", "#10b981", "#ff9c07", "#0ea5e9"],
      stroke: {
        colors: ["transparent"],
        width: 0,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "72%",
            labels: {
              show: true,
              total: {
                show: true,
                showAlways: true,
                label: "Total Revenue",
                fontFamily: "Outfit",
                fontWeight: 600,
                color: "#4b5563",
                formatter: (w) => {
                  const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                  return `$${sum.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
                },
              },
            },
          },
        },
      },
      legend: {
        position: "bottom",
        fontFamily: "Outfit",
      },
      dataLabels: {
        enabled: false,
      },
      tooltip: {
        y: {
          formatter: (val) => `$${val.toLocaleString()}`,
        },
      },
    };

    return { options, series, labels };
  };

  const getStatusPipelineOptions = (): { options: ApexOptions; series: any[] } => {
    if (!analytics) return { options: {}, series: [] };

    const categories = Object.keys(analytics.status_distribution);
    const data = Object.values(analytics.status_distribution);

    const options: ApexOptions = {
      chart: {
        type: "bar",
        fontFamily: "Outfit, sans-serif",
        toolbar: { show: false },
      },
      colors: ["#10b981"],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: "45%",
          distributed: true,
        },
      },
      theme: {
        monochrome: {
          enabled: true,
          color: "#465fff",
          shadeTo: "light",
          shadeIntensity: 0.65,
        },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        tickAmount: 5,
        labels: {
          formatter: (val) => Math.round(val).toString(),
        },
      },
      grid: {
        yaxis: { lines: { show: true } },
      },
    };

    const series = [{ name: "Projects", data }];

    return { options, series };
  };

  const getGrowthOptions = (): { options: ApexOptions; series: any[] } => {
    if (!analytics) return { options: {}, series: [] };

    const categories = analytics.growth_history.map((item) => item.month);
    const data = analytics.growth_history.map((item) => item.count);

    const options: ApexOptions = {
      chart: {
        type: "line",
        fontFamily: "Outfit, sans-serif",
        toolbar: { show: false },
      },
      colors: ["#ff9c07"],
      stroke: {
        curve: "smooth",
        width: 3,
      },
      markers: {
        size: 5,
        colors: ["#ff9c07"],
        strokeColors: "#fff",
        strokeWidth: 2,
      },
      xaxis: {
        categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        tickAmount: 4,
        labels: {
          formatter: (val) => Math.round(val).toString(),
        },
      },
      grid: {
        yaxis: { lines: { show: true } },
      },
    };

    const series = [{ name: "New Clients Added", data }];

    return { options, series };
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getStatusColor = (status: string): "success" | "warning" | "error" | "info" | "primary" => {
    switch (status) {
      case "Active":
        return "success";
      case "Proposal":
        return "info";
      case "Lead":
        return "warning";
      case "Completed":
        return "primary";
      case "On Hold":
      default:
        return "error";
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case "Web Development":
        return "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400";
      case "App Development":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "CRM Integration":
        return "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400";
      case "Consulting":
      default:
        return "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400";
    }
  };

  if (loading && clients.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 pb-12">
        <PageBreadcrumb pageTitle="CRM Client Accounts" />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/30 dark:bg-red-500/5 shadow-theme-xs">
          <h4 className="mb-2 font-semibold text-red-800 dark:text-red-400 flex items-center gap-2">
            ⚠️ Connection Disconnected
          </h4>
          <p className="mb-4 text-sm text-red-600 dark:text-red-400/80">{error}</p>
          <div className="flex gap-3">
            <Button onClick={fetchClientsAndAnalytics} size="sm">
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { options: donutOptions, series: donutSeries } = getServiceShareOptions();
  const { options: barOptions, series: barSeries } = getStatusPipelineOptions();
  const { options: lineOptions, series: lineSeries } = getGrowthOptions();

  return (
    <div className="space-y-6 pb-12">
      <PageMeta
        title="CRM Clients & Projects | Agency Suite"
        description="Manage clients, projects, budgets, and track analysis visualisations for Web, App, and CRM services."
      />
      
      {/* Header with Title and Dedicated Form Link */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageBreadcrumb pageTitle="CRM Client Accounts" />
        <Button onClick={() => navigate("/clients/add")} startIcon={<PlusIcon className="size-5" />}>
          Add Client Account
        </Button>
      </div>


      {/* Metrics Row */}
      {analytics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-theme-xs font-medium text-gray-400 uppercase">Portfolio Value</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {formatCurrency(analytics.total_budget)}
            </h4>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-theme-xs font-medium text-gray-400 uppercase">Active Projects</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {analytics.status_distribution["Active"] || 0}
            </h4>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-theme-xs font-medium text-gray-400 uppercase">Total Leads</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {analytics.status_distribution["Lead"] || 0}
            </h4>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]">
            <span className="text-theme-xs font-medium text-gray-400 uppercase">Total Clients</span>
            <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white/90">
              {analytics.total_clients}
            </h4>
          </div>
        </div>
      )}

      {/* Visual Analytics Row */}
      {analytics && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Revenue by Service (Donut Chart) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-base dark:text-white/90">
              Revenue Share by Service
            </h3>
            <div className="flex justify-center py-2">
              {donutSeries.length > 0 && analytics.total_clients > 0 ? (
                <Chart options={donutOptions} series={donutSeries} type="donut" width="310" />
              ) : (
                <p className="text-gray-400 text-sm py-12">No project budget data registered.</p>
              )}
            </div>
          </div>

          {/* Project Pipeline (Bar Chart) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-base dark:text-white/90">
              Project Pipeline Pipeline
            </h3>
            <div>
              {barSeries.length > 0 && analytics.total_clients > 0 ? (
                <Chart options={barOptions} series={barSeries} type="bar" height="230" />
              ) : (
                <p className="text-gray-400 text-sm py-12">No project pipeline records registered.</p>
              )}
            </div>
          </div>

          {/* Acquisition Timeline (Line Chart) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 font-semibold text-gray-800 text-theme-base dark:text-white/90">
              Acquisition growth
            </h3>
            <div>
              {lineSeries.length > 0 && analytics.total_clients > 0 ? (
                <Chart options={lineOptions} series={lineSeries} type="line" height="230" />
              ) : (
                <p className="text-gray-400 text-sm py-12 flex justify-center items-center">No acquisition history available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Client Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden shadow-theme-xs">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-theme-lg dark:text-white/90">
            Client Accounts List
          </h3>
          <span className="text-theme-xs text-gray-400 font-medium">
            Showing {clients.length} Clients
          </span>
        </div>
        
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-100 dark:bg-white/[0.02] dark:border-gray-800">
              <TableRow>
                <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs uppercase dark:text-gray-400">
                  Client Info
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs uppercase dark:text-gray-400">
                  Service Category
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs uppercase dark:text-gray-400">
                  Pipeline Status
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs uppercase dark:text-gray-400">
                  Deal Budget
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-start text-theme-xs uppercase dark:text-gray-400">
                  Phone Number
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-medium text-gray-500 text-end text-theme-xs uppercase dark:text-gray-400">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                    {/* Client Info */}
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-base dark:bg-brand-500/25">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                            {client.name}
                          </span>
                          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                            {client.company_name} • {client.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Service Type */}
                    <TableCell className="px-6 py-4 text-theme-sm">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-theme-xs font-semibold ${getServiceColor(client.service_type)}`}>
                        {client.service_type}
                      </span>
                    </TableCell>

                    {/* Project Status */}
                    <TableCell className="px-6 py-4">
                      <Badge size="sm" color={getStatusColor(client.project_status)}>
                        {client.project_status}
                      </Badge>
                    </TableCell>

                    {/* Budget */}
                    <TableCell className="px-6 py-4 text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                      {formatCurrency(client.budget)}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="px-6 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {client.phone || "—"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-6 py-4 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white"
                          title="Edit Account"
                        >
                          <PencilIcon className="size-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-500 hover:text-red-700"
                          title="Delete Account"
                        >
                          <TrashBinIcon className="size-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No client records found in SQLite database. Use the "Add Client Account" button to create one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Reusable Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} className="max-w-[550px] p-6 sm:p-8">
        <h3 className="mb-6 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Modify Client Account
        </h3>
        
        {formError && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 dark:bg-red-500/5 dark:border-red-900/30">
            {formError}
          </div>
        )}

        <form onSubmit={handleEditFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-theme-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Contact Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:text-white"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-theme-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:text-white"
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-theme-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:text-white"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-theme-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:text-white"
                placeholder="+1 (555) 0123"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-theme-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Service Category
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                <option value="Web Development">Web Development</option>
                <option value="App Development">App Development</option>
                <option value="CRM Integration">CRM Integration</option>
                <option value="Consulting">Consulting</option>
              </select>
            </div>
            <div>
              <label className="block text-theme-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Pipeline Status
              </label>
              <select
                name="project_status"
                value={formData.project_status}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              >
                <option value="Lead">Lead</option>
                <option value="Proposal">Proposal</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-theme-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Deal Budget ($ USD)
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:text-white"
              placeholder="e.g. 25000"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Update Client
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
