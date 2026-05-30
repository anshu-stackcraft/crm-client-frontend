import React, { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";

const API_BASE = "http://127.0.0.1:8000/api/clients/";

export default function AddClient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    company_name: "",
    email: "",
    phone: "",
    service_type: "Web Development",
    project_status: "Lead",
    budget: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.name || !formData.company_name || !formData.email) {
      setError("Contact Name, Company Name, and Email are required fields.");
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      budget: parseFloat(formData.budget) || 0.0,
    };

    try {
      // Send strictly to Django backend REST API
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errMessage = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(" ") : val}`)
          .join(" ");
        throw new Error(errMessage || "Failed to save client on server.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/clients");
      }, 1500);

    } catch (err: any) {
      console.error("Django backend offline or error occurred:", err);
      setError("Connection Error: Could not connect to Django server database. Please ensure your Django backend is active (python manage.py runserver) before registering a client.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageMeta
        title="Register New Client | CRM Dashboard"
        description="Add a new client and specify their Web, App, or CRM project values."
      />
      <PageBreadcrumb pageTitle="Add Client Account" />

      <div className="mx-auto max-w-[700px] rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
        <div className="mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
          <h3 className="font-semibold text-gray-800 text-theme-lg dark:text-white/90">
            Client Account Details Form
          </h3>
          <p className="text-gray-400 text-theme-xs mt-1">
            Specify contact information, project categories, statuses, and contract budgets.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 dark:bg-red-500/5 dark:border-red-900/30">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-600 dark:bg-emerald-500/5 dark:border-emerald-900/30">
            🎉 Client saved successfully in Django database! Redirecting back to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
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
                required
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
                placeholder="e.g. Acme Corporation"
                required
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
                placeholder="john@company.com"
                required
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
              Deal Budget (₹ INR)
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-brand-500 dark:border-gray-800 dark:text-white"
              placeholder="e.g. 50000"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/clients")}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Register Client"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
