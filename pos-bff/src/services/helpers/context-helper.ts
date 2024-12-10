const { AsyncLocalStorage } = require("async_hooks");
const ContextHelper = new AsyncLocalStorage();

export default ContextHelper;
