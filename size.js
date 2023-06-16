import fs from "fs";

let content = await fs.readFile("product.json",(err,data)=>{
    console.log("Total number of product : " + JSON.parse(data).length);
  });
  