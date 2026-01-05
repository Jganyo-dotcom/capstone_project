const notiSchema = require("../../shared models/notification_model");
const GoalSchema = require("../../shared models/goal.model");
const wp = require("web-push");

wp.setVapidDetails(
  "mailto:elikemejay@gmail.com",
  process.env.publicKey,
  process.env.privatekey
);

// controllers/goalController.js
const Goal = require("../../shared models/goal.model"); // adjust path

// Create a new goal with steps + subscription
async function createGoal(req, res) {
  try {
    const { title, steps, Goal } = req.body;
    const userId = req.user.id; // assuming auth middleware sets req.user

    if (!title || !steps || steps.length === 0) {
      return res.status(400).json({ message: "Title and steps are required" });
    }

    // Validate steps: ensure subscription object exists if provided
    const formattedSteps = steps.map((step, index) => ({
      index: step.index ?? index,
      name: step.name,
      frequency: step.frequency,
      subscription: step.subscription, // allow null if not subscribed yet
      completed: false,
      completedAt: null,
    }));

    const goal = new Goal({
      userId,
      title: Goal,
      StartDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // example: 1 week later
      status: "active",
      steps: formattedSteps,
    });

    await goal.save();

    res.status(201).json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating goal" });
  }
}

module.exports = { createGoal };

async function sendDailyNoti() {
  try {
    const goals = await Goal.find({
      status: "active",
      endDate: { $gte: new Date() },
      "steps.frequency": "Daily",
    });

    for (const goal of goals) {
      const nextIndex = (goal.lastNotifiedStep ?? -1) + 1;

      if (nextIndex < goal.steps.length) {
        const step = goal.steps[nextIndex];

        if (
          step.frequency === "Daily" &&
          step.subscription &&
          step.subscription.endpoint &&
          step.completed === false
        ) {
          const payload = JSON.stringify({
            title: "Daily Step reminder",
            body: `Your step "${step.title}" is waiting to be completed`,
            data: { url: `/steps/${step._id}` },
          });

          await wp.sendNotification(step.subscription, payload);
          console.log(
            `Daily notification sent to user ${goal.userId} for step ${step.title}`
          );

          // 🔑 Persist progress so next run moves forward
          goal.lastNotifiedStep = nextIndex;
          await goal.save();
        } else {
          goal.lastNotifiedStep = nextIndex;
          await goal.save();
        }
      }
    }
  } catch (err) {
    console.error("Error sending weekly notifications:", err);
  }
}

async function sendWeeklyNoti() {
  try {
    const goals = await Goal.find({
      status: "active",
      endDate: { $gte: new Date() },
      "steps.frequency": "weekly",
    });

    for (const goal of goals) {
      const nextIndex = (goal.lastNotifiedStep ?? -1) + 1;

      if (nextIndex < goal.steps.length) {
        const step = goal.steps[nextIndex];

        if (
          step.frequency === "weekly" &&
          step.subscription &&
          step.subscription.endpoint &&
          step.completed === false
        ) {
          const payload = JSON.stringify({
            title: "Weekly Step reminder",
            body: `Your step "${step.title}" is waiting to be completed`,
            data: { url: `/steps/${step._id}` },
          });

          await wp.sendNotification(step.subscription, payload);
          console.log(
            `Weekly notification sent to user ${goal.userId} for step ${step.title}`
          );

          // 🔑 Persist progress so next run moves forward
          goal.lastNotifiedStep = nextIndex;
          await goal.save();
        }
      }
    }
  } catch (err) {
    console.error("Error sending weekly notifications:", err);
  }
}

// reward logic

module.exports = { sendDailyNoti, sendWeeklyNoti, createGoal };
