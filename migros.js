import puppeteer from 'puppeteer';
import fs from "fs";
import { Worker, workerData, parentPort } from 'worker_threads';

const BASE_URL = "https://www.migros.ch/fr/category"
const CATEGORIES =[
    "fruits-legumes",
    "viandes-poissons",
    "produits-laitiers-ufs-plats-prep",
    "boulangerie-patisserie-petit-dej",
    "pates-condiments-conserves",
    "snacks-confiseries",
    "surgeles"
]
const CATEGORIES_PER_WORKER = 2 ;

let workers = []

const create_worker = async (base_url,category) => {
    return new Promise((resolve, reject) => {
        let worker = new Worker("./migros-worker.js", {
            workerData: {
                base_url,
                category
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
    workers.push(create_worker(BASE_URL,CATEGORIES[0]));
    workers.push(create_worker(BASE_URL,CATEGORIES[1]));
    workers.push(create_worker(BASE_URL,CATEGORIES[2]));
    workers.push(create_worker(BASE_URL,CATEGORIES[3]));
    workers.push(create_worker(BASE_URL,CATEGORIES[4]))
    workers.push(create_worker(BASE_URL,CATEGORIES[5]))
    workers.push(create_worker(BASE_URL,CATEGORIES[6]))

const results = await Promise.all(workers);



fs.writeFile("migros.json", JSON.stringify(results.flat(1)), () => {
    console.log(results.flat(1).length +  " products added to file");
})
