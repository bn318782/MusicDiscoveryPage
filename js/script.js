async function searchArtist() {

    const name = document
        .getElementById("artist")
        .value
        .trim();

    const results = document
        .getElementById("results");

    if (!name) {
        results.innerHTML = "Please enter artist";
        return;
    }

    try {
        const response = await fetch(`/.netlify/functions/artist?name=${name}`);
        const data = await response.json();

        if (!data.searchedArtist) {
            results.innerHTML = "Artist not found";
            return;
        }
        let output = `
            <h2>Search Result</h2>
            <p>
                <b>Name:</b> ${data.searchedArtist.name}<br>
                <b>Country:</b> ${data.searchedArtist.country || "Unknown"}<br>
                <b>Genre:</b> ${data.genre}
            </p>
            <h3>Recommended Artists</h3>
        `;

        if (data.recommendations.length === 0) {
            output += `
                <p>No recommendations available</p> `;
        } 
        else {
            data.recommendations.forEach(artist => {
                output += `
                    <p><b>${artist.name}</b></p>`;
            });
        }
        results.innerHTML = output;

    } 

    catch {
        results.innerHTML = "Error retrieving data";
    }
}