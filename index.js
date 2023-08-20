const fs=require('fs');
const axios=require('axios');
const { brotliCompress } = require('zlib');
const express= require('express');
const app=express();

app.use(express.json());

async function fetData(url){
    try{
        const res=await axios.get(url);
        return res.data;
    }
    catch(err){
        console.log(err);
        throw err;
    }
}

async function getAllPages(url){
    let allData=[];
    let currentPage=1;
    while(true){
        const res=await fetData(`${url}?page=${currentPage}`);
        allData=allData.concat(res.data);
        currentPage++;

        if(res.links && res.links.next){
            continue;
        }
        else{
            break;
        }
    }
    return allData;
}

async function main(){
    try{
        const url='https://catfact.ninja/breeds';
        const allBreedData= await getAllPages(url);
        const grouped={};
       
        allBreedData.forEach(breed =>{
            if(!grouped[breed.country]){
                grouped[breed.country]=[];
            }
            grouped[breed.country].push({
                breed: breed.breed,
                origin: breed.origin,
                coat: breed.coat,
                pattern: breed.pattern
            })
        });
            // Log to text file
    fs.writeFileSync('breeds.txt', JSON.stringify(allBreedData, null, 2));

    // Console log the number of pages
    console.log('Number of pages:', allBreedData.length);

    // Console log the grouped data
    console.log(JSON.stringify(grouped, null, 2));
    }
    catch(err){
        console.log(err);
    }
}

main();


//POST
app.post('/', async (req, res) => {
    const payload = await req.body;
    if (!payload || !payload.str) {
        return res.status(400).json({ error: 'Payload is missing or invalid.' });
    }

    const words = payload.str.match(/\b\w+\b/g);
    if (!words || words.length < 8) {
        return res.status(406).json({ error: 'Not Acceptable. At least 8 words are required.' });
    }

    return res.status(200).json({ message: 'OK' });
});

const PORT= 5000;
app.listen(PORT,()=>{
    console.log(`backend listening at http://localhost:${PORT}`);
})


