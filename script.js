// 1. API Keys
const apiKey = "15a19f5422fad14918971bf8640f74bd"; 
const waqiToken = "0f472bef9e2b1dd2e3b7ffae7db8e15f8e9ab56d"; 

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherIcon = document.getElementById("w-icon");

// Search Logic
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        alert("Please Enter City Name!");
    }
});

cityInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") searchBtn.click();
});

// 2. Fetch Weather Data
async function getWeatherData(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === "404") {
            alert("Invalid Input !! City not found");
            return;
        }

        updateUI(data); // UI update call
        getAQI(data.coord.lat, data.coord.lon); // AQI call

    } catch (error) {
        console.error("Error:", error);
    }
}

// 3. UI Update (Bars Filling Logic Included Here)
function updateUI(data) {

    // 1.condition  from api (e.g., 'Haze' or 'Clear')
    // const mainCondition = data.weather[0].main;
    
    const mainCond = data.weather[0].main;      
    const currentTemp = data.main.temp;         
    const currentVisibility = data.visibility;  
    const desc = data.weather[0].description;   

    //bg change
    changeVideoBackground(mainCond, currentTemp, currentVisibility, desc);

    // 1. Basic Text Updates (City, Temp, Description)
    document.getElementById("city-name").innerText = data.name;
    document.getElementById("main-temp").innerText = Math.round(data.main.temp);
    document.getElementById("weather-desc").innerText = data.weather[0].main;
    
    // Feels Like Fix: Math.round + 1 
const feelsSpan = document.getElementById("feels-like-val");
if(feelsSpan) {
   
    feelsSpan.innerText = Math.round(data.main.feels_like) + 1; 
    // console.log("Adjusted Feels Like:", (Math.round(data.main.feels_like) + 1) + "°C");
}
    
    // 2. Weather Icon :
    const wIcon = document.getElementById("w-icon");
    if(wIcon) {
        const iconCode = data.weather[0].icon;
        wIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
        wIcon.style.display = "block";
    }

    // 3. Bottom Stats Text
    document.getElementById("humidity-val").innerText = data.main.humidity + "%";
    document.getElementById("wind-val").innerText = data.wind.speed;
    document.getElementById("visibility-val").innerText = (data.visibility / 1000).toFixed(1) + " km";

    // 1. Thermometer Filling (Scale: -10°C to 50°C)
    const tempRect = document.getElementById("temp-rect");
    if(tempRect) {
        let tPercent = Math.min(Math.max((data.main.temp + 10) / 45, 0), 1); 
        let maxH = 116.2; 
        let newH = tPercent * maxH;
        tempRect.setAttribute("height", newH);
        tempRect.setAttribute("y", 14.7 + (maxH - newH)); 
    }

    // 2. Humidity Droplet Filling
    const humidRect = document.getElementById("humid-rect");
    if(humidRect) {
        let hPercent = data.main.humidity / 100;
        let maxH = 61.8;
        let newH = hPercent * maxH;
        humidRect.setAttribute("height", newH);
        humidRect.setAttribute("y", 17.2 + (maxH - newH));
    }

    // 3. Visibility Filling ( 10km scale)
    const eyeFill = document.getElementById("eye-fill");
    if(eyeFill) {
        let vPercent = Math.min(data.visibility / 10000, 1);
        let maxH = 60;
        let newH = vPercent * maxH;
        eyeFill.setAttribute("height", newH);
        eyeFill.setAttribute("y", 60 - newH);
    }
   
   // MAX MIN TEMP
        const minVal = Math.round(data.main.temp_min);
        const maxVal = Math.round(data.main.temp_max);

        if(minVal === maxVal) {
            document.getElementById("min-temp").innerText = minVal - 2; 
            document.getElementById("max-temp").innerText = maxVal + 2;
        } else {
            document.getElementById("min-temp").innerText = minVal;
            document.getElementById("max-temp").innerText = maxVal;
        }
}
// 4. AQI Logic
async function getAQI(lat, lon) {
    try {
        const waqiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${waqiToken}`;
        const response = await fetch(waqiUrl);
        const result = await response.json();
        
        if (result.status === "ok") {
            const realAQI = result.data.aqi;
            document.getElementById("aqi-val").innerText = realAQI;
            
            let condition = "";
            if (realAQI <= 50) condition = "Good";
            else if (realAQI <= 100) condition = "Satisfactory";
            else if (realAQI <= 200) condition = "Moderate";
            else if (realAQI <= 300) condition = "Poor";
            else if (realAQI <= 400) condition = "Very Poor";
            else condition = "Severe";

            document.getElementById("cond-val").innerText = condition;
            updateCharacterByAQI(realAQI);
        }
    } catch (error) { console.log(error); }
}

function updateCharacterByAQI(aqiValue) {
    const charImg = document.getElementById('char-img');
    if (aqiValue > 150) charImg.src = 'maskgirl.png';
    else charImg.src = 'boy.png';
}

// 5. Clock
function updateClock() {
    const now = new Date();
    document.getElementById("time-val").innerText = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    document.getElementById("date-val").innerText = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock();


function changeVideoBackground(condition, temp, visibility) {
    const video = document.getElementById("bg-vid");
    const source = document.getElementById("video-source");
    let videoUrl = "";

    // 1. PRIORITY 1: rain
  if (condition === 'Light Rain' || condition === 'Rain' || condition === 'Drizzle') {
        videoUrl = "scene5_rain.mp4"; 
    }
    else if (condition === 'Thunderstorm') {
        videoUrl = "scene6_thunderstorm.mp4";
    }else if (temp <= 10) {
        videoUrl = "scene2_heavycold.mp4"; 
    }
        else if (condition === 'Clouds') {
     videoUrl = "scene8_clouds.mp4"; 
    }
    // 2. PRIORITY 2: Mist, Fog, Haze
    else if (condition === 'Mist') {
        videoUrl = "scene7_mist.mp4";
    }
    else if (condition === 'Haze' || condition === 'Fog') {
        videoUrl = (visibility < 2000) ? "scene4_fog.mp4" : "withoutfog.mp4";
    }
   
    // 4. Default
    else {
        videoUrl = "scene1_sunny.mp4";
    }

 console.log("Setting Video To:", videoUrl, "Condition:", condition, "Temp:", temp);

    if (!source.src.includes(videoUrl)) {
        source.src = videoUrl;
        video.load(); 
        video.play().catch(e => console.log("Play error:", e));
    }
}
