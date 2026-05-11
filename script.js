let currentIndex = 0;
let correctCount = 0;
let map;
let gameStarted = false;


let locations = [
    {
        name: "BookStore",
        bounds: { north: 34.2380, south: 34.2370, east: -118.5275, west: -118.5287 }
    },
    {
        name: "Bayramian Hall",
        bounds: { north: 34.2408, south: 34.2400, east: -118.5295, west: -118.5308 }
    },
    {
        name: "Jacaranda Hall",
        bounds: { north: 34.2418, south: 34.2405, east: -118.5275, west: -118.5290 }
    },
    {
        name: "Manzanita Hall",
        bounds: { north: 34.2382, south: 34.2371, east: -118.5297, west: -118.5311 }
    },
    {
        name: "Citrus Hall",
        bounds: { north: 34.2395, south: 34.2385, east: -118.5270, west: -118.5288 }
    }
];


let timer = [0, 0, 0, 0]; // [minutes, seconds, hundredths, total loop count]
let timerInterval; // This will hold the loop so we can stop it later



function initMap() {
    // show high score on load
    let savedScore = localStorage.getItem("mapQuizBestTime");
    if (savedScore) {
        document.getElementById("highscore-display").innerText = savedScore;
    }

    const mapElement = document.getElementById("map");

    // set map and config
    const mapOptions = {
        center: { lat: 34.240, lng: -118.529 },
        zoom: 16.9,
        zoomControl: false,
        gestureHandling: 'none',
        disableDefaultUI: true,
    }

    map = new google.maps.Map(mapElement, mapOptions);

    map.addListener("dblclick", function(event) {
        checkAnswer(event);
    })

    // start game logic
    document.getElementById("start-btn").addEventListener("click", function() {
        gameStarted = true;   // change status of game
        startTimer();         
        this.style.display = "none"; // hide start button after clicking
    });

    // play again logic
    document.getElementById("restart-btn").addEventListener("click", function() {
        location.reload(); 
    });

}

function checkAnswer(event) {
    // block clicking on map if start button hasn't been pressed
    if (gameStarted === false) {
        alert("Please click Start Game before guessing!");
        return; 
    }

    let clickedLat = event.latLng.lat();
    let clickedLng = event.latLng.lng();
    let currentBuilding = locations[currentIndex];
    let bounds = currentBuilding.bounds;
    
    if (clickedLat >= bounds.south && clickedLat <= bounds.north &&
        clickedLng >= bounds.west && clickedLng <= bounds.east) {
            $(".question-item").eq(currentIndex).addClass("correct");
            $(".question-item").eq(currentIndex).text("That's Correct!");
            drawShape(bounds, "#2ecc71");
            correctCount++;
        } else {
            $(".question-item").eq(currentIndex).addClass("incorrect");
            $(".question-item").eq(currentIndex).text("Incorrect Location.");
            drawShape(bounds, "#e74c3c");
        }
        currentIndex++;

            if (currentIndex == 5) {
                endGame();
        }
}

function drawShape(bounds, color) {
    new google.maps.Rectangle({
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.35,
        map: map,
        bounds: bounds
    });
}

function leadingZero(time) {
    if (time <= 9) {
        time = '0' + time;
    }
    return time;
}

function startTimer() {
    // Run this loop every 10 milliseconds
    timerInterval = setInterval(function() {
        let currentTime = leadingZero(timer[0]) + ":" + leadingZero(timer[1]) + ":" + leadingZero(timer[2]);
        
        // update the screen
        document.getElementById("timer-display").innerText = currentTime;
        
        // calculate minutes/seconds/hundredths
        timer[3]++;
        timer[0] = Math.floor((timer[3] / 100) / 60); // minutes
        timer[1] = Math.floor(timer[3] / 100) - (timer[0] * 60); // seconds
        timer[2] = Math.floor(timer[3] - (timer[1] * 100) - (timer[0] * 6000)); // hundredths
        
    }, 10);
}


function stopTimer() {
    clearInterval(timerInterval);
}

function endGame() {
    gameStarted = false;
    stopTimer();
    
    // hide question list after game ends
    $("#question-list").addClass("hidden");
    
    // 3. Show the Game Over screen container
    $("#game-over-screen").removeClass("hidden");
    
    // calculate score
    let incorrectCount = 5 - correctCount;
    $("#final-score").text(correctCount + " Correct, " + incorrectCount + " Incorrect");
    
    // extra credit: final time
    let finalTime = document.getElementById("timer-display").innerText;
    $("#final-score").append("<br><br>Your Time: " + finalTime);
    
    // extra credit: high score display
    let bestTime = localStorage.getItem("mapQuizBestTime");
    
    // only count high score if they get all questions right
    if (correctCount === 5) {
        if (!bestTime || finalTime < bestTime) {
            localStorage.setItem("mapQuizBestTime", finalTime);
            bestTime = finalTime;
            $("#final-score").append("<br><br>NEW HIGH SCORE!");
        }
    } else {
        // msg for non perfect score finishes
        $("#final-score").append("<br><br>Get all 5 right to save a high score!");
    }

    if (bestTime) {
        $("#final-score").append("<br>High Score: " + bestTime);
    }

}


