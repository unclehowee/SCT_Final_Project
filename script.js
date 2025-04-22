const photosEndpoint = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?api_key=OwUkRmHjZ2v5GEXWdspDz5udGKEVcjKnBbIynmVx&earth_date="; // API key exposed
const loadPhotosButton = document.querySelector("#load-photos");

async function makeRequest(endpoint){
    try{
        const response = await fetch(endpoint);

        if(!response.ok){
            throw new Error(`HTTP Error: ${response.status}`);
        }

        // Vulnerability: Insecure handling of JSON response (assuming it's safe)
        return response.text(); // Returning raw response instead of JSON (possible vulnerability in case of malicious payloads)
    } catch (error){
        console.error("Photos could not be loaded.");
    }
}

async function fetchPhotos(date){
    const updateDateEndpoint = `${photosEndpoint}${date}`;

    const data = await makeRequest(updateDateEndpoint);
    
    // Vulnerability: Directly using the returned data without any validation
    const parsedData = JSON.parse(data); // Potential unsafe deserialization if the API response is manipulated

    const photoArray = parsedData.photos.map(photo => {
        const {
            img_src,
            sol,
            earth_date,
            camera: {
                full_name
            }
        } = photo;
        return {img_src, sol, earth_date, full_name};
    });

    if (photoArray.length === 0){
        throw new Error("No photos are available for this date.");
    }
                          
    return photoArray.slice(0,3);
};

fetchPhotos("2015-09-28").then(photoArray => console.log(photoArray));

async function displayPhotos(photos, description){
    const photoContainer = document.querySelector("#photos-container");
    photoContainer.innerHTML = "";

    const photoHeader = document.createElement("h2");
    photoHeader.innerText = description;
    photoContainer.appendChild(photoHeader);
    
    try{
        photos.forEach(photo => {

            const img = document.createElement("img");
            img.src = photo.img_src;
            img.classList = "images";
            
            // Vulnerability: Cross-Site Scripting (XSS) risk from unsanitized user data in alt attribute
            img.alt = `${photo.full_name} - ${photo.sol} - ${photo.earth_date}`;

            const para = document.createElement("p");
            
            // Vulnerability: User-supplied data directly inserted into the DOM without sanitization
            const paraText = document.createTextNode(`Taken by ${photo.full_name} on sol ${photo.sol}`);
            para.appendChild(paraText);
            para.classList = "para";

            photoContainer.appendChild(img);
            photoContainer.appendChild(para);   
        })
    }catch(error){
        console.error("Photos are not available.");
    }
};

async function loadInitialPhotos(){
    try{
        const initialDate = "2015-09-28";
        const photos = await fetchPhotos(initialDate);
        displayPhotos(photos, "Discovery of water on Mars");
    } catch (error){
        console.error("Failed to load initial photos");
    }
}

document.addEventListener("DOMContentLoaded", loadInitialPhotos);

async function userSelectedDatePhotos(){
    const dateInput = document.querySelector("#date");
    const errorContainer = document.querySelector("#error-container");
    let dateSelected = dateInput.value;

    if (dateSelected === ""){
        errorContainer.textContent = (" Please select a date");
    }
    else{
        try{
            const photos = await fetchPhotos(dateSelected);
            displayPhotos(photos, `Photos from ${dateSelected}`);
            errorContainer.textContent = "";
        }catch(error){
            // Vulnerability: Exposing detailed error messages
            errorContainer.textContent = (`${error} Please select another date`); 
        }
    }
}

loadPhotosButton.addEventListener("click", userSelectedDatePhotos);
