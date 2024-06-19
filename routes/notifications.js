const express = require("express");
const route = express.Router();
const Notification = require("../models/notification");

route
  .put("/:id/read", async (req, res) => {
    const { id } = req.params;
    try {
      const notification = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findById(id);
      if (!notification)
        return res.status(404).json({ message: "Notifications not found" });

      res.status(200).json(notification);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .get("/allNotificaions", async (req, res) => {
    try {
      const notifications = await Notification.find({});
      if (!notifications)
        return res.status(404).json({ message: "Notifications not found" });
      res.status(200).json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

  .delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findByIdAndDelete(id);
      if (!notification)
        return res.status(404).json({ message: "Notifications not found" });
      res.status(200).json({ message: "Notifications successfully deleted" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = route;
