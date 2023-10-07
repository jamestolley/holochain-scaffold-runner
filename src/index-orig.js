const { readFileSync } = require('fs');
const yargs = require('yargs');
const { exec } = require('node:child_process');

const args = yargs.argv;

if (typeof args.configfile == 'undefined' || typeof args.windowtitle == 'undefined') {
  console.log("USAGE: node src/index.js --configfile [config filename] --windowtitle [window title]");
  process.exit();
}

const data = readFileSync(`./${args.configfile}`);
const config = JSON.parse(data);
// console.log(JSON.parse(data));
// process.exit();

run();
async function run() {
// put the focus on the specified window
console.log(`running: xdotool search "${args.windowtitle}" windowactivate`);
  exec(`xdotool search "${args.windowtitle}" windowactivate`, async (err, stdout, stderr) => {
    if (err) {
      console.error(`Got error: '${err}'`);
    } else {
      console.log(`Got stdout: '${stdout}'`);
      await sleep(1000);
      console.log(`running: xdotool type "nix run github:holochain/holochain#hc-scaffold -- web-app" && xdotool key Return`);
      exec(`xdotool type "nix run github:holochain/holochain#hc-scaffold -- web-app" && xdotool key Return`, async (err, stdout, stderr) => {
        if (err) {
          console.error(`Got error: '${err}'`);
        } else {
          console.log(`Got stdout: '${stdout}'`);
          await sleep(1000);
          console.log(`running: xdotool type "${config.app_name}" && xdotool key Return`);
          exec(`xdotool type "${config.app_name}" && xdotool key Return`, async (err, stdout, stderr) => {
            if (err) {
              console.error(`Got error: '${err}'`);
            } else {
              console.log(`Got stdout: '${stdout}'`);
              process.exit();
              await sleep(1000);
              console.log(`running: `);
              exec(`xdotool `, async (err, stdout, stderr) => {
                if (err) {
                  console.error(`Got error: '${err}'`);
                } else {
                  console.log(`Got stdout: '${stdout}'`);
                  await sleep(1000);
                  console.log(`running: xdotool type "${config.app_name}`);
                  exec(`xdotool type "${config.app_name}"`, async (err, stdout, stderr) => {
                    if (err) {
                      console.error(`Got error: '${err}'`);
                    } else {
                      console.log(`Got stdout: '${stdout}'`);
                      await sleep(1000);
                      console.log(`running: `);
                      exec(`xdotool `, async (err, stdout, stderr) => {
                        if (err) {
                          console.error(`Got error: '${err}'`);
                        } else {
                          console.log(`Got stdout: '${stdout}'`);
                          
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });

  // send it the nix command to start the scaffolding tool

  // send it the App name

}

// exec('echo "Hello, world"', (err, stdout, stderr) => {
//   if (err) {
//     console.error(`Error: '${err}'`);
//     return;
//   }
//   console.log(`Stdout: '${stdout}'`);
// });


function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}