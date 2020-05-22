const AutoClean = require('./autocleaning');


main();
async function main(){
    try{
        var User = require('./config.json');
        for(let i of User){
            await getClient(i);
            await sleep(7);
        }
        process.exit();

    }
    catch(err){
        if(err.message.search('Cannot find module') != -1){
            console.log('No config file, using standard input');
            new AutoClean();
            process.exit();
        }
        else{
            console.error(err.message);
        }
    }
}


async function getClient(data) {
    return new Promise(resolve=>{
        new AutoClean(data);
        resolve();
    })
}

async function sleep(second) {
    return new Promise(resolve=>{
        setTimeout(resolve, second * 1000);
    })
}