const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const GovernmentScheme = require("../models/GovernmentScheme");

const SEED_SCHEMES = [
  {
    title: "Ayushman Bharat PM-JAY",
    description:
      "Health cover of Rs. 5 lakh per family per year for secondary and tertiary hospitalisation across empanelled hospitals in India.",
    eligibility:
      "Bottom 40% of population as per SECC 2011 data. No cap on family size or age.",
    state: "central",
    category: "insurance",
    sourceUrl: "https://pmjay.gov.in",
    launchedAt: new Date("2018-09-23"),
  },
  {
    title: "Pradhan Mantri Suraksha Bima Yojana",
    description:
      "Accidental death and disability cover of Rs. 2 lakh at just Rs. 20 per year premium through savings bank accounts.",
    eligibility:
      "Age 18-70 years, having a savings bank account linked to Aadhaar.",
    state: "central",
    category: "insurance",
    sourceUrl: "https://jansuraksha.gov.in",
    launchedAt: new Date("2015-05-09"),
  },
  {
    title: "Pradhan Mantri Jeevan Jyoti Bima Yojana",
    description:
      "Life insurance cover of Rs. 2 lakh for death due to any reason at annual premium of Rs. 436 per year.",
    eligibility:
      "Age 18-50 years with a bank account. Auto-renewable annually.",
    state: "central",
    category: "insurance",
    sourceUrl: "https://jansuraksha.gov.in",
    launchedAt: new Date("2015-05-09"),
  },
  {
    title: "Janani Suraksha Yojana",
    description:
      "Cash assistance to pregnant women for institutional delivery to reduce maternal and infant mortality rates across India.",
    eligibility:
      "Pregnant women from BPL households. All states covered under NHM.",
    state: "central",
    category: "maternal",
    sourceUrl: "https://nhm.gov.in",
    launchedAt: new Date("2005-04-12"),
  },
  {
    title: "Pradhan Mantri Matru Vandana Yojana",
    description:
      "Maternity benefit programme providing Rs. 6000 cash incentive to pregnant and lactating mothers for first live birth.",
    eligibility:
      "Pregnant women and lactating mothers for their first child. Age 19+.",
    state: "central",
    category: "maternal",
    sourceUrl: "https://wcd.nic.in",
    launchedAt: new Date("2017-01-01"),
  },
  {
    title: "Rashtriya Arogya Nidhi",
    description:
      "Financial assistance up to Rs. 15 lakh for BPL patients suffering from major life-threatening diseases treated at government hospitals.",
    eligibility:
      "BPL patients with life-threatening diseases like cancer, kidney failure, heart disease at central government hospitals.",
    state: "central",
    category: "general",
    sourceUrl: "https://mohfw.gov.in",
    launchedAt: new Date("1997-01-01"),
  },
  {
    title: "UP Free Medicine Scheme (Mukhyamantri Arogya)",
    description:
      "Free essential medicines available at all government hospitals, CHCs and PHCs across Uttar Pradesh with over 500 medicines on the list.",
    eligibility:
      "All patients visiting government health facilities in Uttar Pradesh. No income criteria.",
    state: "Uttar Pradesh",
    category: "medicine",
    sourceUrl: "https://uphealth.up.nic.in",
    launchedAt: new Date("2012-06-01"),
  },
  {
    title: "UP Mukhyamantri Jan Arogya Yojana",
    description:
      "Health insurance cover for families not covered under PM-JAY, providing Rs. 5 lakh per family per year in UP.",
    eligibility:
      "UP residents not eligible under PM-JAY. Families with income below Rs. 2.5 lakh per annum.",
    state: "Uttar Pradesh",
    category: "insurance",
    sourceUrl: "https://uphealth.up.nic.in",
    launchedAt: new Date("2019-09-01"),
  },
  {
    title: "Atal Amrit Abhiyan",
    description:
      "Cashless treatment for critical illnesses covering cancer, cardiac, renal and neurological diseases for BPL and APL families.",
    eligibility:
      "Families with annual income below Rs. 5 lakh. Assam state residents.",
    state: "Assam",
    category: "insurance",
    sourceUrl: "https://nhm.assam.gov.in",
    launchedAt: new Date("2016-07-25"),
  },
  {
    title: "Mahatma Jyotiba Phule Jan Arogya Yojana",
    description:
      "Health insurance scheme covering 996 medical procedures for below-poverty-line families in Maharashtra.",
    eligibility:
      "BPL families, farmers in debt and other specified categories in Maharashtra.",
    state: "Maharashtra",
    category: "insurance",
    sourceUrl: "https://jeevandayee.gov.in",
    launchedAt: new Date("2012-07-02"),
  },
];

async function seedSchemes() {
  const count = await GovernmentScheme.countDocuments();
  if (count === 0) {
    await GovernmentScheme.insertMany(SEED_SCHEMES);
    console.log("Government schemes seeded");
  }
}

router.get("/", protect, async (req, res) => {
  try {
    await seedSchemes();
    const { category, state, search } = req.query;
    const query = { isActive: true };
    if (category && category !== "all") query.category = category;
    if (state && state !== "all") query.state = state;
    if (search)
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { eligibility: { $regex: search, $options: "i" } },
      ];
    const schemes = await GovernmentScheme.find(query).sort({ launchedAt: -1 });
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
