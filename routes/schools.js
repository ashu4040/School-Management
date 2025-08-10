// routes/schools.js
const express = require("express");
const router = express.Router();
const Joi = require("joi");
const pool = require("../db");

// Validation schema using Joi
const addSchoolSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required(),
  address: Joi.string().trim().min(1).max(500).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

// Haversine formula to compute distance in kilometers
function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// POST /addSchool
router.post("/addSchool", async (req, res) => {
  try {
    const { error, value } = addSchoolSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });

    const { name, address, latitude, longitude } = value;

    const sql =
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
    const [result] = await pool.execute(sql, [
      name,
      address,
      latitude,
      longitude,
    ]);

    return res.status(201).json({
      success: true,
      data: { id: result.insertId, name, address, latitude, longitude },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /listSchools?latitude=..&longitude=..
router.get("/listSchools", async (req, res) => {
  try {
    const lat = parseFloat(req.query.latitude);
    const lon = parseFloat(req.query.longitude);

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message:
          "latitude and longitude query parameters are required and must be valid numbers.",
      });
    }

    const [rows] = await pool.query(
      "SELECT id, name, address, latitude, longitude FROM schools"
    );

    const withDistance = rows.map((r) => {
      const distance_km = haversineDistance(
        lat,
        lon,
        Number(r.latitude),
        Number(r.longitude)
      );
      return { ...r, distance_km };
    });

    withDistance.sort((a, b) => a.distance_km - b.distance_km);

    return res.json({
      success: true,
      count: withDistance.length,
      data: withDistance,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
