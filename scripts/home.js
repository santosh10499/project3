
let tweetOffset = 0;
let runningCriticalFunction = false;

/*================= Function to get Tweets ==================================================================================*/

async function getTweetsAndInsertHTML() {
    if(runningCriticalFunction) {
        return;
    }
    runningCriticalFunction = true;
    const result = await fetch(`https://twitter-backend-6yot.onrender.com/tweet/recent?offset=${tweetOffset}`); // Paginated API 

    const tweets = await result.json();

    console.log(tweets.data);

    tweetOffset = tweetOffset + tweets.data.length;

    document.getElementById('tweet-body').insertAdjacentHTML('beforeend', tweets.data.map((tweet) => {
        let currentTime = new Date();
        let showTime;
        let postedTime = new Date(tweet.creationDatetime);
        let timeDiff = currentTime - postedTime;
        timeDiff = Math.round(timeDiff/1000);

        if (timeDiff < 60) {
            showTime = timeDiff + 's';
        }
        else if (timeDiff >= 60 && timeDiff < 3600) {
            timeDiff = Math.round(timeDiff / 60);
            showTime = timeDiff + 'm';
        }
        else if (timeDiff >= 3600 && timeDiff < (3600 * 24)) {
            timeDiff = Math.round(timeDiff / 3600);
            showTime = timeDiff + 'h';
        }
        else if (timeDiff >= (3600 * 24) && timeDiff < (3600 * 24 * 30)) {
            timeDiff = Math.round(timeDiff / (3600 * 24));
            showTime = timeDiff + 'd';
        }
        else if (timeDiff >= (3600 * 24 * 30) && timeDiff < (3600 * 24 * 30 * 12)) {
            timeDiff = Math.round(timeDiff / (3600 * 24 * 30));
            showTime = timeDiff + 'm';
        }
        
        return `<div id=${tweet._id} class="tweets">
            <div class="tweet-profile-image">
            <img
                src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDV8fHBlcnNvbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
                alt="profile image"
            />
            </div>
            <div class="tweet">
                <div class="tweet-header">
                    <div class="tweet-user-info">
                        <p id="tweet-userName">${loginUserName}</p>
                        <p id="tweet-userId">@${userName}.. |</p>
                        <p id="tweet-time">${showTime}</p>
                    </div>
                    <div class="tweet-three-dots-menu">
                        <button data-id=${tweet._id} class="tweet-edit" id="tweet-edit">
                            Edit
                        </button>
                        <button data-id=${tweet._id} class="tweet-delete" id="tweet-delete">
                            Delete
                        </button>
                        <button id="tweet-three-dots">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fill="#5b7083"
                                d="M16.5 10.25c-.965 0-1.75.787-1.75 1.75s.784 1.75 1.75 1.75c.964 0 1.75-.786 1.75-1.75s-.786-1.75-1.75-1.75zm0 2.5c-.414 0-.75-.336-.75-.75 0-.413.337-.75.75-.75s.75.336.75.75c0 .413-.336.75-.75.75zm-4.5-2.5c-.966 0-1.75.787-1.75 1.75s.785 1.75 1.75 1.75 1.75-.786 1.75-1.75-.784-1.75-1.75-1.75zm0 2.5c-.414 0-.75-.336-.75-.75 0-.413.337-.75.75-.75s.75.336.75.75c0 .413-.336.75-.75.75zm-4.5-2.5c-.965 0-1.75.787-1.75 1.75s.785 1.75 1.75 1.75c.964 0 1.75-.786 1.75-1.75s-.787-1.75-1.75-1.75zm0 2.5c-.414 0-.75-.336-.75-.75 0-.413.337-.75.75-.75s.75.336.75.75c0 .413-.336.75-.75.75z"
                            ></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="tweet-body">
                    <span id='span-${tweet._id}'>${tweet.title}
                    </span>
                </div>
                <div class="tweet-footer-icons">
                    <span class="material-icons">bar_chart</span>
                    <span class="material-icons">chat_bubble_outline</span>
                    <span class="material-icons">repeat</span>
                    <span class="material-icons">favorite_border</span>
                    <span class="material-icons">file_upload</span>
                </div>
            </div>
        </div>`
    }).join(""));
    runningCriticalFunction = false;
}

window.onload = async () => {
    getTweetsAndInsertHTML();
}


/*================= Function to Create Tweet ==================================================================================*/

document.addEventListener('click', async (event) => {
    if(event.target.classList.contains('tweet-post-btn')) {
        const tweetText = document.querySelector('.tweet-post-text').value;

        const data = {
            title: tweetText,
            text: "Random Value",
            userId: "12345"
        }
        
        const tweetResponse = await fetch('https://twitter-backend-6yot.onrender.com/tweet/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })

        const tweet = await tweetResponse.json();

        if(tweet.status !== 200) {
            alert(tweet.message);
            return;
        }

        document.querySelector('.tweet-post-text').value = "";
        alert(tweet.message);
    }

/*================= Function to Delete Tweet ==================================================================================*/

    if(event.target.classList.contains('tweet-delete')) {

        if(confirm("Are you sure you want to delete this tweet?")) {
            const tweetId = event.target.getAttribute('data-id');

            const data = {
                tweetId,
                userId: "12345"
            };

            const response = await fetch('https://twitter-backend-6yot.onrender.com/tweet/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })

            const result = await response.json();

            if(result.status !== 200) {
                alert(result.message);
                return;
            }
            
            alert("Tweet deleted successfuly");
            document.getElementById(tweetId).remove();
        }
    }

/*================= Function to Update Tweet ==================================================================================*/

    if(event.target.classList.contains('tweet-edit')) {
        const tweetId = event.target.getAttribute('data-id');

        const span = document.getElementById('span-' + tweetId);

        const tweetText = prompt("Enter new tweet text", span.innerText);

        const data = {
            tweetId,
            title: tweetText,
            text: "Random value",
            userId: "12345"
        }

        const response = await fetch('https://twitter-backend-6yot.onrender.com/tweet/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })

        const result = await response.json();

        if(result.status !== 200) {
            alert(result.message);
            return;
        }

        alert("Updated Successfully");
        span.innerText = tweetText;
    }

}) 


/*================= Function to get Tweets on Scroll ==================================================================================*/

window.addEventListener('scroll', () => {
    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    if((scrollTop + clientHeight) >= (scrollHeight - 20)) {
        getTweetsAndInsertHTML();
    }
})












// This is for login user name
let loginEmail = localStorage.getItem("twitterLoginEmail");
let loginUser = JSON.parse(localStorage.getItem("twitterSignUpData"));
console.log(loginEmail)

for(let i=0;i<loginUser.length;i++)
{
    if(loginEmail==loginUser[i].email)
    {
        var loginUserName=loginUser[i].name;
        var userName=loginUser[i].username;
    }
}

// this is for profile name in navbar
let profile=document.getElementById('userprofile');
profile.innerHTML=` <p id="navbar-profile-name">${loginUserName}</p>
<p id="navbar-profile-id">@${userName}..</p>`;








/*=============================== Function to Logout =================================*/

const ThreeDotsProfile = document.getElementById("profile-threeDots");
const profileThreeDotsPopUp = document.getElementById("profile-threeDots-popUp");
const profileLogOut = document.getElementById("profile-logOut");
const profifeId=document.getElementById('profile-userId');


document.addEventListener("click", (e) => {

    if (e.target.id == "profile-threeDots"){
        profileThreeDotsPopUp.style.display = "block";
    } else {
        profileThreeDotsPopUp.style.display = "none";
    }
    
})
profileLogOut.addEventListener("click", () => {

     window.location.href = "index.html";
    
})


//for dynamic changing username 
profifeId.innerText='@'+userName +"..";

