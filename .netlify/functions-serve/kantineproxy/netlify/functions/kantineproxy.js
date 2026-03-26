var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/kantineproxy.js
var kantineproxy_exports = {};
__export(kantineproxy_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(kantineproxy_exports);
var handler = async (event, context) => {
  try {
    const response = await fetch(
      "https://infoskaerm.techcollege.dk/umbraco/api/content/getcanteenmenu/?type=json",
      {
        headers: {
          Referer: "https://infoskaerm.techcollege.dk/",
          Origin: "https://infoskaerm.techcollege.dk",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      }
    );
    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: `Upstream returned ${response.status}` })
      };
    }
    const text = await response.text();
    const weekMatch = text.match(/<Week>(\d+)<\/Week>/);
    const week = weekMatch ? parseInt(weekMatch[1]) : null;
    const days = [];
    const dayRegex = /<CanteenDay>[\s\S]*?<DayName>(.*?)<\/DayName>[\s\S]*?<Dish>(.*?)<\/Dish>[\s\S]*?<\/CanteenDay>/g;
    let match;
    while ((match = dayRegex.exec(text)) !== null) {
      days.push({ DayName: match[1], Dish: match[2] });
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Week: week, Days: days })
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Failed to fetch canteen menu",
        details: err.message
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=kantineproxy.js.map
