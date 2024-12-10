module.exports = function sortJson(inp) {
  if (typeof inp == "string") {
    return inp;
  } else {
    let keys = Object.keys(inp).sort();
    let out = {};
    keys.forEach((i) => {
      if (inp[i] != null) {
        out[i] = sortJson(inp[i]);
      }
    });
    return out;
  }
};
