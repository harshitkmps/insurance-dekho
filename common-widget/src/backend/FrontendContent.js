const FrontendContent = require("./models/FrontendContentModel");

const frontendContentController = {
  getContent: async (req, res) => {
    try {
      const conditions = {
        targetLOBs: req.query.targetLOBs,
        typeOfContent: req.query.typeOfContent,
      };
      if (req.query.active === "true") {
        conditions.active = true;
      } else if (req.query.active === "false") {
        conditions.active = false;
      }
      const content = await FrontendContent.find(conditions).sort({
        createdAt: -1,
      });
      return res.status(200).json({ message: "OK", content });
    } catch (err) {
      console.error("error in get user content", err);
      return res.status(err.status || 500).json({ message: "error", err });
    }
  },
  addContent: async (req, res) => {
    try {
      const content = new FrontendContent({
        targetLOBs: req.body.targetLOBs,
        typeOfContent: req.body.typeOfContent,
        contentProps: req.body.contentProps,
        criteria: req.body.criteria,
      });

      const contentDetails = await content.save();
      return res.status(200).json({
        message: "OK",
        data: "Content added successfully",
        contentDetails,
      });
    } catch (err) {
      console.error("error in add user content", err);
      return res.status(err.status || 500).json({ message: "error", err });
    }
  },
  updateContent: async (req, res) => {
    try {
      await FrontendContent.findByIdAndUpdate(req.params.id, req.body);
      return res
        .status(200)
        .json({ message: "OK", data: "Content updated successfully" });
    } catch (err) {
      console.error("error in update user content", err);
      return res.status(err.status || 500).json({ message: "error", err });
    }
  },
};

module.exports = frontendContentController;
