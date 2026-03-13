const fetch = require("node-fetch");
exports.handler = async function(event) {
    try {
        const name = event.queryStringParameters.name;
        if(!name){
            return{
                statusCode:400,
                body:JSON.stringify({
                    error:"Missing artist name"
                })
            };
        }

        const artistResponse = await fetch(
            `https://musicbrainz.org/ws/2/artist/?query=${name}&fmt=json`
        );
        const artistData = await artistResponse.json();

        if(!artistData.artists.length){
            return{
                statusCode:200,
                body:JSON.stringify({
                    searchedArtist:null,
                    genre:null,
                    recommendations:[]
                })
            };
        }

        const mainArtist = artistData.artists[0];

        let genre=null;

        if(mainArtist.tags && mainArtist.tags.length){
            const validTags = mainArtist.tags
                .sort((a,b)=>b.count-a.count)
                .filter(tag=>tag.count>1);
            if(validTags.length){
                genre=validTags[0].name;
            }
        }

        let recommendations=[];

        if(genre){
            const genreResponse = await fetch(
                `https://musicbrainz.org/ws/2/artist/?query=tag:${genre}&fmt=json`
            );
            const genreData = await genreResponse.json();
            recommendations = genreData.artists

                .filter(a=>
                    a.name &&
                    a.country &&
                    a.name!==mainArtist.name &&
                    a.name!=="Various Artists" &&
                    a.name!=="[unknown]"
                )
                .slice(0,5);
        }

        return{
            statusCode:200,
            body:JSON.stringify({
                searchedArtist:mainArtist,
                genre:genre || "Unknown",
                recommendations:recommendations
            })
        };
    }

    catch{
        return{
            statusCode:500,
            body:JSON.stringify({
                error:"API failure"
            })
        };
    }
};