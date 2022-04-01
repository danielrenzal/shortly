//navigation bar
const menuBtn = document.querySelector(".menu-btn");
const nav = document.querySelector("nav");

window.addEventListener('resize',()=>{
    const checkClass = nav.classList.length;
    const width = screen.width

    if (checkClass === 1 && width >= 1024){
        nav.classList.remove("display-nav");
    }
})

menuBtn.addEventListener("click",()=>{
    nav.classList.toggle("display-nav");
})




//form
const errorMessage = document.querySelector(".error-message")
const shortenBtn = document.querySelector(".shorten-btn");
const urlInput = document.querySelector(".url-input");
const linksContainer = document.querySelector(".links-generated-container");
let linksArray = [];

shortenBtn.addEventListener("click", async(event)=>{
    event.preventDefault();
    const inputValue = urlInput.value;

    startLoading();

    if(inputValue === ""){
        stopLoading();
        displayError("Please add a link");
    }else{
        try {
            const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${inputValue}`);
            if(!response.ok){
                stopLoading();
                displayError("Your URL is invalid");
        }else{
            stopLoading();
            urlInput.classList.remove("empty-input-warning"); //in case the user got an error then
            errorMessage.style.display = "none";             //went okay after the second attempt

            const data = await response.json();
            const shortLink = data.result.full_short_link;
            const longLink = data.result.original_link;
            saveToLocalStorage(shortLink, longLink);
        }
        } catch (error) {
            stopLoading();
            displayError("No internet connection.");
        }
        
    }
})



//displaying saved links from local storage
//but first, check if there is a data
const checkLocalStorage = JSON.parse(localStorage.getItem("links"));

if(checkLocalStorage){
    //if there is a data, store it to the linksArray
    linksArray = checkLocalStorage;
    displayData();
}



function displayError(message){
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
    urlInput.classList.add("empty-input-warning");
}

function displayData(){
    let displayItems = "";
    for (let i=0; i<linksArray.length; i++){
        //inserting data into a <li> element then saving to a variable for displaying
        displayItems += `<li>
                            <p class="long-link">${linksArray[i].long}</p>
                            <hr>
                            <p class="short-link">${linksArray[i].short}</p>
                            <button type="button" onClick="copyToClipboard(this)" class="copy-btn">Copy</button>
                            <button type="button" onClick="removeElement(this)" class="remove-btn">Remove</button>
                        </li>`
    }
    linksContainer.innerHTML = displayItems;
}


function saveToLocalStorage(shortUrl, longUrl){
    //saving to array first as an object then to local storage na
    linksArray.unshift({short: shortUrl, long: longUrl});
    localStorage.setItem("links", JSON.stringify(linksArray));

    //retrieving from the local storage for displaying
    linksArray = JSON.parse(localStorage.getItem("links"));

    //removing the value from input
    urlInput.value = "";

    displayData();
}


function copyToClipboard(button){
    const copyShortLink = button.parentElement.querySelector(".short-link");
    const otherBtns = button.parentElement.parentElement.querySelectorAll(".copy-btn");

    otherBtns.forEach(btns=>{
        btns.style.backgroundColor = "hsl(180, 66%, 49%)";
        btns.textContent = "Copy";
    })

    navigator.clipboard.writeText(copyShortLink.textContent).then(()=>{
        button.style.backgroundColor = "hsl(257, 27%, 26%)";
        button.textContent = "Copied!";
    }).catch(error=>{
        console.log(error)});
}

function removeElement(button){
    const copyShortLink = button.parentElement.querySelector(".short-link").textContent;
    
    console.log(linksArray.length)
    linksArray = linksArray.filter(linkItem=>linkItem.short != copyShortLink);
    console.log(linksArray.length)
    localStorage.setItem("links", JSON.stringify(linksArray));
    displayData();
}


function startLoading(){
    shortenBtn.disabled = true;
    shortenBtn.innerHTML = `<span class="loading-animation"></span>`;
}
function stopLoading(){
    shortenBtn.disabled = false;
    shortenBtn.textContent = `Shorten it!`;
}