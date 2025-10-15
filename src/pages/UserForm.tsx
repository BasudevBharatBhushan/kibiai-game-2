import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import kibiaiLogo from "../assets/images/kibiai.png";
import titleImage from "../assets/images/title.png";
import skeletonImage from "../assets/images/skeleton.png";
import kibizsystems from "../assets/images/kibizsystems.png";

const API_URL = "https://python-fm-dapi-weaver.onrender.com/api/dataApi";
const AUTH_HEADER = "Basic RGV2ZWxvcGVyOmFkbWluYml6";

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    address: "",
  });

  // Auto redirect if valid session exists
  useEffect(() => {
    const stored = localStorage.getItem("kibiai_user");
    if (stored) {
      const { expiry } = JSON.parse(stored);
      if (new Date(expiry) > new Date()) {
        navigate("/preview");
      } else {
        localStorage.removeItem("kibiai_user");
      }
    }
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      alert("Name and Email are required");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Check if user exists
      const findPayload = {
        fmServer: "kibiz-linux.smtech.cloud",
        method: "findRecord",
        methodBody: {
          database: "KibiAIDemo",
          layout: "KiBiAIUser",
          limit: 1,
          dateformats: 0,
          query: [{ UserEmail: formData.email }],
        },
        session: {
          token: "",
          required: "",
          kill_session: true,
        },
      };

      const findResponse = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify(findPayload),
      });

      const findData = await findResponse.json();

      // Handle if null is returned
      const records =
        findData && findData.records && Array.isArray(findData.records)
          ? findData.records
          : [];

      let recordId = null;
      if (records.length > 0) {
        recordId = records[0].recordId;
      }

      // Step 2: Create or update record
      const method = recordId ? "updateRecord" : "createRecord";
      const payload: any = {
        fmServer: "kibiz-linux.smtech.cloud",
        method,
        methodBody: {
          database: "KibiAIDemo",
          layout: "KiBiAIUser",
          record: {
            Name: formData.name,
            Phone: formData.phone,
            UserEmail: formData.email,
            Company: formData.company,
            Address: formData.address,
          },
        },
        session: {
          token: "",
          required: "",
          kill_session: true,
        },
      };

      if (recordId) payload.methodBody.recordId = recordId;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: AUTH_HEADER,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === "created" || data.status === "updated") {
        // Step 3: Store in localStorage with 6-month expiry
        const userData = {
          recordId: data.recordId,
          ...data.fieldData,
          session: data.session,
        };
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 6);

        localStorage.setItem(
          "kibiai_user",
          JSON.stringify({ userData, expiry: expiry.toISOString() })
        );

        // Step 4: Redirect to /preview
        navigate("/preview");
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Network or API error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center overflow-x-hidden overflow-y-auto">
      <div className="flex flex-col justify-between items-center w-full h-full px-6 py-12 lg:py-14 xl:py-2 max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <img
            src={kibizsystems}
            alt="KiBiz Systems"
            className="h-16 lg:h-20 object-contain"
          />
          <img
            src={titleImage}
            alt="Prompt-O-Saurus"
            className="h-24 lg:h-32 object-contain"
          />
        </div>

        {/* Form Section */}
        <div className="flex flex-col items-center justify-center flex-1 w-full mt-4 mb-6">
          <h1 className="text-2xl font-bold text-[#5e17eb] mb-6">
            User Information
          </h1>

          <form
            className="w-full bg-gray-100 rounded-2xl shadow-md p-6 lg:p-8 flex flex-col gap-5"
            onSubmit={handleSubmit}
          >
            {/* Name */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#5e17eb] mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#5e17eb] mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#5e17eb] mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Company */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#5e17eb] mb-1">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5e17eb]"
                placeholder="Enter your company name"
              />
            </div>

            {/* Address */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-[#5e17eb] mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5e17eb] resize-none"
                placeholder="Enter your address"
                rows={3}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-10 py-3 text-lg ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <img src={skeletonImage} alt="" className="h-6 lg:h-7" />
              <span>{loading ? "PROCESSING..." : "SUBMIT"}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 mt-2 mb-2">
          <p className="text-[#7456e1] text-sm lg:text-base font-semibold">
            POWERED BY
          </p>
          <img
            src={kibiaiLogo}
            alt="KiBi-AI"
            className="h-16 lg:h-20 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default UserForm;
