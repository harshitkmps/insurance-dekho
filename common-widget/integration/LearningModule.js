let LearningModule = document.createElement("div");
LearningModule.setAttribute("id", "LearningModuleContainer");
document.querySelector('body').appendChild(LearningModule)

var learningWidget = new CommonWidget(
  "LearningModuleContainer",
  "LearningModule"
);
learningWidget.setEventListener(function (event, payload) {
  console.log(event, payload);
});
learningWidget.init({});
