const { exec } = require("child_process");

// Path to your .bat file
const batFilePath = `public/easter.bat`; 
// ↑ IMPORTANT: keep the quotes if path has spaces

export function runBat() {
    console.log("Running .bat file at:", new Date().toLocaleString());

    exec(batFilePath, (error, stdout, stderr) => {
        if (error) {
            console.error("Error:", error.message);
            return;
        }

        if (stderr) {
            console.error("stderr:", stderr);
            return;
        }

        console.log("Output:", stdout);
    });
}

// Run immediately (optional)
runBat();

// Run every 3 hours
setInterval(runBat, 3 * 60 * 60 * 1000);