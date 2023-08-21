import fs from "fs";
import { Worker } from 'worker_threads';

const MIN_THREAD = 1;
const MAX_THREAD = 16;
const DISABLE_THREAD_SELECTION = true
const DEFAULT_NB_THREAD = 1;
const valid_file_regex = new RegExp(/^[0-9a-zA-Z ... ]+$/);
const config = JSON.parse(fs.readFileSync("../config.json",{encoding:"utf8"}));

if(DISABLE_THREAD_SELECTION){
    if(!process.argv[2] || !process.argv[3]){
        console.error("Usage : node index.js <shop_name> <output_file>");
        process.exit(1);
    }
    if(!config[process.argv[2]] ){
        console.error("Shop " + process.argv[2] + " not found or not implemented yet");
        process.exit(1);
    }
    if(!valid_file_regex.test(process.argv[3]) || process.argv[3].split('.')[1] != "json"){
        console.error("Filename is invalid or the file isn't a JSON");
        process.exit(1);
    }
}else{
    if(!process.argv[2] || !process.argv[3]){
        console.error("Usage : node index.js <shop_name> <nb_thread>");
    } else if(!config[process.argv[2]] ){
        console.error("Shop " + process.argv[2] + " not found or not implemented yet");
    }else if(isNaN(process.argv[3]) || process.argv[3] < MIN_THREAD || process.argv[3] > MAX_THREAD){
        console.error("nb_thread need to be a number between 1 and 16")
    }
}
const shop_config = config[process.argv[2]];

const create_worker = async (base_url,categories,worker_name) => {
    return new Promise((resolve, reject) => {
        let worker = new Worker("./workers/" +worker_name, {
            workerData: {
                base_url,
                categories
            }
        });
        worker.on("message", (data) => {
            resolve(data);
        })
        worker.on("error", (err) => {
            reject();
        })
    })
}

let workers = [];
if(DISABLE_THREAD_SELECTION){
    let start_index = 0 ;
    let min_nb_cat = Math.round(shop_config.categories.length / DEFAULT_NB_THREAD);
    let end_index = min_nb_cat;
    for(let i = 0 ; i < DEFAULT_NB_THREAD; i++){
        const categories = shop_config.categories.slice(start_index,end_index)
        workers.push(create_worker(shop_config.base_url,categories,shop_config.worker))
        start_index = end_index;
        if(i+2 == DEFAULT_NB_THREAD){
            end_index = shop_config.categories.length;
        }else{
            end_index+ min_nb_cat < shop_config.categories.length ? end_index+=min_nb_cat : end_index = shop_config.categories.length
        }
    }
    const results = await Promise.all(workers);
    fs.writeFile("../" + process.argv[3], JSON.stringify(results.flat(1)), () => {
        console.log(results.flat(1).length +  " products added to file");
    })

}






