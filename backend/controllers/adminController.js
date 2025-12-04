import User from "../models/User.js";
import Claim from "../models/Claim.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import axios from "axios";
import { io } from "../server.js";

export const registerAgent = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const agentCount = await User.countDocuments({ role: "agent" });
    if (agentCount >= 3) {
      return res.status(400).json({
        message: "Agent limit reached. Maximum 3 agents allowed."
      });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    const randomPassword = crypto.randomBytes(5).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const agent = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "agent",
      isVerified: true,
      currentLoad: 0
    });
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', 'Helvetica', Arial, sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden my-8">
        <!-- Header -->
        <div class="bg-[#1976d2] text-white px-8 py-6">
            <div class="flex justify-between items-start">
                <div>
                    <h1 class="text-2xl font-bold">AutoSureAI</h1>
                    <p class="text-blue-100 text-sm mt-1">Insurance Agent Portal</p>
                </div>
                <div class="text-right">
                    <p class="text-blue-100 text-xs">Agent Account Created</p>
                    <p class="text-white text-xs font-medium">${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>

        <!-- Welcome Section -->
        <div class="px-8 py-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-800 mb-2">Welcome to AutoSureAI</h2>
            <p class="text-gray-600 mb-1">Hello <span class="font-semibold text-[#1976d2]">${name}</span>,</p>
            <p class="text-gray-600">Your Insurance Agent account has been successfully created and is ready for claims processing.</p>
        </div>

        <!-- Credentials Box -->
        <div class="bg-[#f5f5f5] border-2 border-[#1976d2] rounded-lg mx-8 my-6 p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-[#1976d2]" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                </svg>
                Your Login Credentials
            </h3>

            <div class="space-y-3">
                <div class="flex items-center">
                    <span class="w-20 text-sm font-semibold text-gray-700">Email:</span>
                    <span class="text-gray-900 font-medium bg-white px-3 py-1 rounded border border-gray-300 text-sm">${email}</span>
                </div>
                <div class="flex items-center">
                    <span class="w-20 text-sm font-semibold text-gray-700">Password:</span>
                    <span class="text-gray-900 font-medium bg-white px-3 py-1 rounded border border-gray-300 text-sm font-mono">${randomPassword}</span>
                </div>
            </div>

            <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p class="text-xs text-yellow-800 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    For security reasons, please change your password after first login.
                </p>
            </div>
        </div>

        <!-- Action Section -->
        <div class="px-8 py-6">
            <h3 class="text-lg font-bold text-gray-800 mb-3">Start Reviewing Claims</h3>
            <p class="text-gray-600 mb-4">You can now log in to the Insurance Agent Portal and start processing claims using our AI-powered assessment system.</p>

            <a href="#" class="inline-flex items-center bg-[#1976d2] hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Access Agent Portal
            </a>
        </div>

        <!-- Features Grid -->
        <div class="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <h4 class="text-md font-semibold text-gray-800 mb-4">Agent Capabilities:</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-[#1976d2] mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-600">Review and process insurance claims</span>
                </div>
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-[#1976d2] mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-600">Access AI damage assessments</span>
                </div>
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-[#1976d2] mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-600">Approve repair cost estimates</span>
                </div>
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-[#1976d2] mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-600">Manage client policies</span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="bg-[#f5f5f5] px-8 py-6 border-t border-gray-300">
            <div class="mb-4">
                <p class="text-xs font-semibold text-gray-700 mb-2">CLAIMS SUPPORT: 1-800-AUTO-CLAIM • support@autosureai.com</p>
            </div>
            <div class="text-center">
                <p class="text-xs text-gray-600 mb-1">
                    This email was automatically generated by AutoSureAI's Insurance Agent System.
                </p>
                <p class="text-xs text-gray-500">
                    Confidential - For authorized insurance agent use only
                </p>
                <p class="text-xs text-gray-400 mt-2">
                    Generated on ${new Date().toLocaleString()}
                </p>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-300 text-center">
                <p class="text-sm font-semibold text-gray-800">AutoSureAI Team</p>
                <p class="text-xs text-gray-600">AI-Powered Insurance Claims Processing</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "AutoSureAI", email: process.env.BREVO_SMTP_USER},
        to: [{ email }],
        subject: "Your AutoSureAI Agent Login Credentials",
        htmlContent: emailHtml,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    res.json({
      success: true,
      message: "Agent registered successfully. Login credentials sent to the email.",
      agent,
    });

  } catch (err) {
    console.error("registerAgent error:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const listAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: "agent" }).select("-password");
    res.json({ success: true, agents });
  } catch (err) {
    console.error("listAgents error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }
    const agent = await User.findOneAndUpdate({ _id: id, role: "agent" }, update, { new: true }).select("-password");
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json({ success: true, agent });
  } catch (err) {
    console.error("updateAgent error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await User.findOneAndDelete({ _id: id, role: "agent" });
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json({ success: true, message: "Agent deleted" });
  } catch (err) {
    console.error("deleteAgent error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const registerTraffic = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "User already exists" });
    const randomPassword = crypto.randomBytes(5).toString("hex"); 
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    const traffic = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "traffic",
      isVerified: true,
      currentLoad: 0,
    });
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', 'Helvetica', Arial, sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden my-8">
        <!-- Header -->
        <div class="bg-[#1976d2] text-white px-8 py-6">
            <div class="flex justify-between items-start">
                <div>
                    <h1 class="text-2xl font-bold">AutoSureAI</h1>
                    <p class="text-blue-100 text-sm mt-1">Traffic Authority Portal</p>
                </div>
                <div class="text-right">
                    <p class="text-blue-100 text-xs">Account Created</p>
                    <p class="text-white text-xs font-medium">${new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>

        <!-- Welcome Section -->
        <div class="px-8 py-6 border-b border-gray-100">
            <h2 class="text-xl font-bold text-gray-800 mb-2">Welcome to AutoSureAI</h2>
            <p class="text-gray-600 mb-1">Hello <span class="font-semibold text-[#1976d2]">${name}</span>,</p>
            <p class="text-gray-600">Your Traffic Authority account has been successfully created and is ready for use.</p>
        </div>

        <!-- Credentials Box -->
        <div class="bg-[#f5f5f5] border-2 border-[#1976d2] rounded-lg mx-8 my-6 p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-[#1976d2]" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
                </svg>
                Your Login Credentials
            </h3>

            <div class="space-y-3">
                <div class="flex items-center">
                    <span class="w-24 text-sm font-semibold text-gray-700">Email:</span>
                    <span class="text-gray-900 font-medium bg-white px-3 py-1 rounded border border-gray-300 text-sm">${email}</span>
                </div>
                <div class="flex items-center">
                    <span class="w-24 text-sm font-semibold text-gray-700">Password:</span>
                    <span class="text-gray-900 font-medium bg-white px-3 py-1 rounded border border-gray-300 text-sm font-mono">${randomPassword}</span>
                </div>
            </div>

            <div class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p class="text-xs text-yellow-800 flex items-center">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    For security reasons, please change your password after first login.
                </p>
            </div>
        </div>

        <!-- Action Section -->
        <div class="px-8 py-6">
            <h3 class="text-lg font-bold text-gray-800 mb-3">Get Started</h3>
            <p class="text-gray-600 mb-4">You can now log in to the Traffic Authority Portal and start verifying accident reports using our AI-powered assessment system.</p>

            <a href="#" class="inline-flex items-center bg-[#1976d2] hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition duration-200">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
                Access Portal
            </a>
        </div>

        <!-- Features Grid -->
        <div class="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <h4 class="text-md font-semibold text-gray-800 mb-4">What You Can Do:</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-[#1976d2] mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-600">Verify and validate accident reports</span>
                </div>
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-[#1976d2] mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-600">Access AI-powered damage assessments</span>
                </div>
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-[#1976d2] mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-600">Review repair cost estimates</span>
                </div>
                <div class="flex items-start">
                    <svg class="w-5 h-5 text-[#1976d2] mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                    </svg>
                    <span class="text-sm text-gray-600">Manage traffic incident data</span>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="bg-[#f5f5f5] px-8 py-6 border-t border-gray-300">
            <div class="mb-4">
                <p class="text-xs font-semibold text-gray-700 mb-2">EMERGENCY CONTACTS: 100, 112, 102, 108, 1073, 1033</p>
            </div>
            <div class="text-center">
                <p class="text-xs text-gray-600 mb-1">
                    This email was automatically generated by AutoSureAI's Traffic Authority System.
                </p>
                <p class="text-xs text-gray-500">
                    Confidential - For authorized traffic authority use only
                </p>
                <p class="text-xs text-gray-400 mt-2">
                    Generated on ${new Date().toLocaleString()}
                </p>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-300 text-center">
                <p class="text-sm font-semibold text-gray-800">AutoSureAI Team</p>
                <p class="text-xs text-gray-600">AI-Powered Vehicle Damage Assessment</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "AutoSureAI", email: process.env.BREVO_SMTP_USER },
        to: [{ email }],
        subject: "Your AutoSureAI Traffic Officer Login Credentials",
        htmlContent: emailHtml,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      message: "Traffic officer registered successfully. Login details emailed.",
      traffic,
    });
  } catch (err) {
    console.error("registerTraffic error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const reassignClaim = async (req, res) => {
  try {
    const claimId = req.params.id;
    const { newAgentId } = req.body;

    const claim = await Claim.findById(claimId)
      .populate("assignedAgent", "name email phone assignedClaims currentLoad")
      .populate("driverId", "name email phone vehicleNumber")
      .populate({
        path: "reportId",
        select: "imageUrl prediction repair_cost status createdAt reportUrl location verification trafficVerification",
      });

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const oldAgent = claim.assignedAgent;
    const newAgent = await User.findById(newAgentId);

    if (!newAgent || newAgent.role !== "agent") {
      return res.status(400).json({ message: "Invalid agent" });
    }

    if (oldAgent) {

      if (!oldAgent.assignedClaims) {
        oldAgent.assignedClaims = [];
      }

      oldAgent.assignedClaims = oldAgent.assignedClaims.filter(
        (id) => id.toString() !== claim._id.toString()
      );

      oldAgent.currentLoad = Math.max(0, oldAgent.currentLoad - 1);
      await oldAgent.save();
    }

    if (!newAgent.assignedClaims) {
      newAgent.assignedClaims = [];
    }

    if (!newAgent.assignedClaims.includes(claim._id)) {
      newAgent.assignedClaims.push(claim._id);
    }

    newAgent.currentLoad += 1;
    await newAgent.save();

    claim.assignedAgent = newAgent._id;
    await claim.save();

    if (io) {
      io.to(`user_${newAgent._id}`).emit("new_claim_assigned", {
        claimId: claim._id,
        reportId: claim.reportId,
        severity: claim.severity,
        estimatedCost: claim.estimatedCost,
        reassigned: true
      });

      if (oldAgent) {
        io.to(`user_${oldAgent._id}`).emit("claim_reassigned", {
          claimId: claim._id,
          newAgent: newAgent._id
        });
      }
    }

    res.json({
      success: true,
      message: "Claim reassigned successfully",
      claim: {
        _id: claim._id,
        status: claim.status,
        assignedAgent: {
          _id: newAgent._id,
          name: newAgent.name,
          email: newAgent.email
        },
        previousAgent: oldAgent ? {
          _id: oldAgent._id,
          name: oldAgent.name,
          email: oldAgent.email
        } : null
      }
    });
  } catch (err) {
    console.error("reassignClaim error:", err);
    res.status(500).json({ message: err.message });
  }
};
export const deleteTraffic = async (req, res) => {
  try {
    const { id } = req.params;

    const officer = await User.findOneAndDelete({
      _id: id,
      role: "traffic"
    });

    if (!officer)
      return res.status(404).json({ message: "Traffic officer not found" });

    res.json({ success: true, message: "Traffic officer deleted successfully" });
  } catch (err) {
    console.error("deleteTraffic error:", err);
    res.status(500).json({ message: err.message });
  }
};
export const listTraffic = async (req, res) => {
  try {
    const officers = await User.find({ role: "traffic" }).select("-password");
    res.json({ success: true, officers });
  } catch (err) {
    console.error("listTraffic error:", err);
    res.status(500).json({ message: err.message });
  }
};
export const updateTraffic = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };

    if (update.password) {
      update.password = await bcrypt.hash(update.password, 10);
    }

    const officer = await User.findOneAndUpdate(
      { _id: id, role: "traffic" },
      update,
      { new: true }
    ).select("-password");

    if (!officer)
      return res.status(404).json({ message: "Traffic officer not found" });

    res.json({ success: true, officer });
  } catch (err) {
    console.error("updateTraffic error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" }).select("+password");
    if (!admin) return res.status(400).json({ message: "Admin not found" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ 
      success: true, 
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role:"admin" }
    });
  } catch (err) {
    console.error("Admin Login Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .populate("driverId", "name email phone vehicleNumber")
      .populate("assignedAgent", "name email phone")
      .populate({
        path: "reportId",
        select: "prediction repair_cost location createdAt reportUrl imageUrl",
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, claims });
  } catch (err) {
    console.error("getAllClaims error:", err);
    res.status(500).json({ message: err.message });
  }
};