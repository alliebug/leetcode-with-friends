/**
 * This function is needed to setup our contentMain as an ES6 module (along with setting up web_accessible_resources in the manifest).
 */
async function setup_main() {
    const src = chrome.runtime.getURL("src/contentMain.js");
    console.log(src);
    const contentMain = await import(src);
    contentMain.main();
}

setup_main();
