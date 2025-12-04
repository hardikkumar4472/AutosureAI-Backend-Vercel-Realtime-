import Accident from "../models/Accident.js";
import Claim from "../models/Claim.js";

export const getAdminAnalytics = async (req, res) => {
  try {

    const severityStats = await Accident.aggregate([
      { $group: { _id: "$prediction.severity", count: { $sum: 1 } } }
    ]);

    const costStats = await Accident.aggregate([
      {
        $group: {
          _id: "$prediction.severity",
          avgEstimated: { $avg: "$repair_cost.estimated_cost" },
          avgMin: { $avg: "$repair_cost.min_cost" },
          avgMax: { $avg: "$repair_cost.max_cost" }
        }
      }
    ]);

    const monthlyTrend = await Accident.aggregate([
      {
        $addFields: { yearMonth: { $dateToString: { format: "%Y-%m", date: "$createdAt" } } }
      },
      {
        $group: { _id: "$yearMonth", count: { $sum: 1 } }
      },
      { $sort: { _id: 1 } }
    ]);

    const claimStats = await Claim.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    const verificationStats = await Accident.aggregate([{ $group: { _id: "$verification.status", count: { $sum: 1 } } }]);

    const totalVerifications = await Accident.countDocuments({ "verification.status": { $in: ["verified", "fraudulent"] } });
    const fraudulentCountAgg = await Accident.aggregate([
      { $match: { "verification.status": "fraudulent" } },
      { $count: "fraudCount" }
    ]);
    const fraudCount = fraudulentCountAgg[0]?.fraudCount || 0;
    const fraudPercentage = totalVerifications === 0 ? 0 : (fraudCount / totalVerifications) * 100;

    const avgVerificationAgg = await Accident.aggregate([
      { $match: { "verification.verifiedAt": { $exists: true } } },
      {
        $project: {
          diffMs: { $subtract: ["$verification.verifiedAt", "$createdAt"] }
        }
      },
      {
        $group: {
          _id: null,
          avgMs: { $avg: "$diffMs" }
        }
      }
    ]);
    const avgVerificationMs = avgVerificationAgg[0]?.avgMs || null;

    const settlementAgg = await Claim.aggregate([
      { $match: { "settlementInfo.settledAt": { $exists: true } } },
      {
        $project: {
          diffMs: { $subtract: ["$settlementInfo.settledAt", "$createdAt"] }
        }
      },
      { $group: { _id: null, avgMs: { $avg: "$diffMs" } } }
    ]);
    const avgSettlementMs = settlementAgg[0]?.avgMs || null;

    res.json({
      success: true,
      data: {
        severityStats,
        costStats,
        monthlyTrend,
        claimStats,
        verificationStats,
        fraud: { totalVerifications, fraudCount, fraudPercentage },
        avgVerificationMs,
        avgSettlementMs
      }
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ message: err.message });
  }
};