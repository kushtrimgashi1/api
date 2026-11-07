import("file:///C:/Users/DELL/Documents/Default%20Project/api/i18n-data.js").then(m => {
  const n = m.KEYS.length; let bad = 0;
  for (const c of Object.keys(m.LOCALES)) if (m.LOCALES[c].length !== n) { bad++; console.log("MISMATCH", c, m.LOCALES[c].length); }
  console.log("keys", n, bad ? "FAIL" : "OK");
  console.log("sample", m.LOCALES.sq[m.KEYS.indexOf("privacy.analytics")]);
});
