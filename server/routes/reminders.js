const express = require("express");
const router = express.Router();
const cron = require("node-cron");
const { protect } = require("../middleware/auth");
const Reminder = require("../models/Reminder");
const User = require("../models/User");
const { sendReminderEmail } = require("../utils/mailer");

router.get("/", protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const {
      medicineName,
      dosage,
      scheduleTimes,
      frequency,
      startDate,
      endDate,
    } = req.body;
    if (!medicineName || !scheduleTimes?.length || !startDate) {
      return res.status(400).json({
        message: "Medicine name, schedule times and start date are required",
      });
    }
    const reminder = await Reminder.create({
      userId: req.user._id,
      medicineName,
      dosage,
      scheduleTimes,
      frequency,
      startDate,
      endDate: endDate || null,
    });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }
    Object.assign(reminder, req.body);
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.patch("/:id/taken", protect, async (req, res) => {
  try {
    const { date, time, takenOrNot } = req.body;
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found" });
    }

    const existing = reminder.takenLog.find(
      (l) => l.date === date && l.time === time,
    );
    if (existing) {
      existing.takenOrNot = takenOrNot;
    } else {
      reminder.takenLog.push({ date, time, takenOrNot });
    }
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    await Reminder.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

function startReminderCron() {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const today = now.toISOString().split("T")[0];
      const dayOfWeek = now.getDay();

      const reminders = await Reminder.find({
        isActive: true,
        scheduleTimes: currentTime,
        startDate: { $lte: now },
        $or: [{ endDate: null }, { endDate: { $gte: now } }],
      }).populate("userId", "name email preferredLanguage");

      for (const rem of reminders) {
        if (rem.frequency === "weekly" && dayOfWeek !== 1) {
          continue;
        }
        if (rem.frequency === "alternate") {
          const start = new Date(rem.startDate);
          const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
          if (diff % 2 !== 0) {
            continue;
          }
        }
        const alreadySent = rem.takenLog.find(
          (l) => l.date === today && l.time === currentTime && l.takenOrNot,
        );
        if (alreadySent) {
          continue;
        }

        const user = rem.userId;
        if (!user || !user.email) {
          continue;
        }

        try {
          await sendReminderEmail(user.email, user.name, [
            {
              medicineName: rem.medicineName,
              dosage: rem.dosage,
              time: currentTime,
            },
          ]);
          console.log(
            `Reminder email sent to ${user.email} for ${rem.medicineName} at ${currentTime}`,
          );
        } catch (emailErr) {
          console.error(
            `Failed to send reminder email to ${user.email}:`,
            emailErr.message,
          );
        }
      }
    } catch (err) {
      console.error("Cron job error:", err.message);
    }
  });
  console.log("Medicine reminder cron job started");
}

module.exports = router;
module.exports.startReminderCron = startReminderCron;
