import Accident from "../models/Accident.js";

export const getPublicHotspots = async (req, res) => {
  try {
    const precision = parseInt(req.query.precision || "3", 10); 
    const minCount = parseInt(req.query.minCount || "1", 10);
    const factor = Math.pow(10, precision);

    const hotspots = await Accident.aggregate([
      {
        $project: {
          lat: { $round: [{ $multiply: ["$location.lat", factor] }, 0] },
          lon: { $round: [{ $multiply: ["$location.lon", factor] }, 0] },
          severity: "$prediction.severity"
        }
      },
      {
        $group: {
          _id: { lat: "$lat", lon: "$lon" },
          count: { $sum: 1 },
          severities: { $push: "$severity" }
        }
      },
      {
        $project: {
          _id: 0,
          lat: { $divide: ["$_id.lat", factor] },
          lon: { $divide: ["$_id.lon", factor] },
          count: 1,
          severities: 1
        }
      },
      { $match: { count: { $gte: minCount } } },
      {
        $project: {
          type: "Feature",
          geometry: { type: "Point", coordinates: ["$lon", "$lat"] },
          properties: {
            count: "$count",
            severityBreakdown: {
              $arrayToObject: {
                $map: {
                  input: [{ $literal: "minor" }, { $literal: "moderate" }, { $literal: "severe" }],
                  as: "sev",
                  in: [
                    "$$sev",
                    { $size: { $filter: { input: "$severities", as: "s", cond: { $eq: ["$$s", "$$sev"] } } } }
                  ]
                }
              }
            }
          }
        }
      }
    ]);

    res.json({ success: true, type: "FeatureCollection", features: hotspots });
  } catch (err) {
    console.error("getPublicHotspots err:", err);
    res.status(500).json({ message: err.message });
  }
};