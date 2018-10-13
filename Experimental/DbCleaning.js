const config = require('../firebaseConfig.json');
const firebase = require('firebase');
firebase.initializeApp(config);
let database = firebase.database();

async function main() {
    await NewC();
    //await ClearALL();
    console.log("done");
}

async function NewC() {
    database.ref("/users").once('value').then((val)=>{
        console.log(val.val());
    })
    await database.ref('/NEW-Collections-Meta').remove();
    await database.ref('NEW-Collections').remove();
    await database.ref('Collections-Meta').remove();
    await database.ref('errors').remove();
    await database.ref('general').remove();
    await database.ref('LoginErrorBook').remove();
    await database.ref("AllContent").remove();
    await database.ref("AllContents").remove();
    await database.ref("Collections").remove();
    await database.ref("YoutubePlaylistData").remove();
}
async function ClearALL(){
    await database.ref("/").set(":)");
}

main();
