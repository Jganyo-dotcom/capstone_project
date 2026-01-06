const notiSchema = require("../../shared models/notification_model");
const wp = require("web-push");
const Goal = require("../../modules/Goal_managent_module/goal_model"); // adjust path

// Create a new goal with steps + subscription
// async function createGoal(req, res) {
//   try {
//     const { title, steps } = req.body;
//     const userId = req.user.id; //  auth middleware sets req.user

//     if (!title || !steps || steps.length === 0) {
//       return res.status(400).json({ message: "Title and steps are required" });
//     }
//     console.log(steps);

//     const goal = new Goal({
//       userId,
//       title,
//       StartDate: new Date(), // user will say okay
//       endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // example: 1 week later but user will input this
//       status: "active",
//       steps: steps, // save steps array directly
//       lastNotifiedStep: 0, // dont worry about this it helps me to send reminders
//     });

//     await goal.save();
//     res.status(201).json(goal);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error creating goal" });
//   }
// }



async function sendDailyNoti() {
  try {
    const goals = await Goal.find({
      status: "active",
      endDate: { $gte: new Date() },
      "steps.frequency": "Daily",
    });

    for (const goal of goals) {
      // figure out which step we should notify
      const currentIndex = goal.lastNotifiedStep ?? 0;
      const step = goal.steps[currentIndex];

      if (
        step &&
        step.frequency === "Daily" &&
        step.subscription &&
        step.subscription.endpoint &&
        step.completed === false
      ) {
        const payload = JSON.stringify({
          title: "Daily Step reminder",
          body: `Your step "${step.name}" is waiting to be completed`,
          data: { url: `/steps/${step._id}` },
        });

        await wp.sendNotification(step.subscription, payload);
        console.log(
          `Daily notification sent to user ${goal.userId} for step ${step.name}`
        );

        
      } else if (step && step.completed === true) {
        // If the current step is done, move to the next one
        goal.lastNotifiedStep = currentIndex + 1;
        await goal.save();
      }
    }
  } catch (err) {
    console.error("Error sending daily notifications:", err);
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
      // figure out which step we should notify
      const currentIndex = goal.lastNotifiedStep ?? 0;
      const step = goal.steps[currentIndex];

      if (
        step &&
        step.frequency === "weekly" &&
        step.subscription &&
        step.subscription.endpoint &&
        step.completed === false
      ) {
        const payload = JSON.stringify({
          title: "Daily Step reminder",
          body: `Your step "${step.name}" is waiting to be completed`,
          data: { url: `/steps/${step._id}` },
        });

        await wp.sendNotification(step.subscription, payload);
        console.log(
          `weekly notification sent to user ${goal.userId} for step ${step.name}`
        );
      } else if (step && step.completed === true) {
        goal.lastNotifiedStep = currentIndex + 1;
        await goal.save();
      }
    }
  } catch (err) {
    console.error("Error sending daily notifications:", err);
  }
}

// async function clearGoals(req, res) {
//   try {
//     await Goal.deleteMany({});
//     res.status(200).json({ message: "All goals cleared successfully" });
//   } catch (err) {
//     console.error("Error clearing goals:", err);
//     res.status(500).json({ message: "Error clearing goals" });
//   }
// }

// reward logic goes here

module.exports = { sendDailyNoti, sendWeeklyNoti };
