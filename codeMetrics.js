import fs from "fs";
import path from "path";

const DIRECTORIES_TO_SCAN = [
  { name: "MVC", path: "./mvc/src" },
  { name: "Hexagonal", path: "./hexagonal/src" },
];

const countMetrics = (directory) => {
  let totalLines = 0;
  let totalFunctions = 0;
  let totalClasses = 0;
  let totalFiles = 0;

  const traverseDirectory = (dir) => {
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️ Directory not found: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        traverseDirectory(fullPath);
      } else if (file.endsWith(".js")) {
        totalFiles++;
        const content = fs.readFileSync(fullPath, "utf8");

        const lines = content.split("\n").length;
        totalLines += lines;

        const functionMatches = content.match(
          /function\s+\w+|\w+\s*=\s*\(.*?\)\s*=>|\basync\s+\w+\s*\(.*?\)\s*{/g
        );
        totalFunctions += functionMatches ? functionMatches.length : 0;

        const classMatches = content.match(/class\s+\w+/g);
        totalClasses += classMatches ? classMatches.length : 0;
      }
    });
  };

  traverseDirectory(directory);

  return { totalLines, totalFunctions, totalClasses, totalFiles };
};

console.log("\n================ CODE METRICS =================");

DIRECTORIES_TO_SCAN.forEach(({ name, path }) => {
  console.log(`\n📂 Analyzing: ${name} (${path})`);
  const results = countMetrics(path);

  console.log(`📁 Files Analyzed: ${results.totalFiles}`);
  console.log(`📄 Total Lines of Code: ${results.totalLines}`);
  console.log(`🔹 Functions Count: ${results.totalFunctions}`);
  console.log(`🔸 Classes Count: ${results.totalClasses}`);
  console.log("--------------------------------------------");
});
