"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
//  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
//  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.signup(username, password, name);

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  $signupForm.trigger("reset");        
}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
//  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
  $(".main-nav-links").hide();
  $stars.hide();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
//  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
//  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
//  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
  hidePageComponents();
  putStoriesOnPage();
  $stars.show();
  checkFavs();
}

function checkFavs() {
  try{
    for(let fav of currentUser.favorites) {    
      toggleStoryFav($("#"+fav.storyId).find(".fa-star"));
    }  
  } catch(e) {
    console.debug(`Could not load favorites - error ${e}`);
  }
}

/**
 * 
 * addFavorite - adds the favorite to the API and from
 * currentUser.favorites[]. 
 * 
 * Note: API POST with favorites call will return a list of the User's favorites,
 * so we just update the array by mapping the returned data.
 * 
 * @param {*} clickedStar - jQuery element, favorite star that was
 * clicked by user
 */

async function addFavorite(clickedStar) {
  try{
    const fav = clickedStar.parent();
    const cStoryId = fav[0].id;  
    const response = await axios.post(
      `${BASE_URL}/users/${currentUser.username}/favorites/${cStoryId}`, 
      {
        token: currentUser.loginToken
      });   
    let obj = response.data.user.favorites;
    currentUser.favorites = obj.map(s => new Story(s));  
    
    return obj;

  } catch(e) {
    console.debug(`Error - Could not add favorite - Return code: ${e}`);
    return 0;
  }
}

/**
 * 
 * removeFavorite - removes the favorite from the API and from
 * currentUser.favorites[]. 
 * 
 * Note: API delete call will return a list of the User's favorites,
 * so we just update the array by mapping the returned data.
 * 
 * @param {*} clickedStar - jQuery element, favorite star that was
 * clicked by user
 */

async function removeFavorite(clickedStar) {
  try{
    const fav = clickedStar.parent();
    const cStoryId = fav[0].id;
    const response = await axios.delete(
      `${BASE_URL}/users/${currentUser.username}/favorites/${cStoryId}`, 
      {
        params:
        {
          token: currentUser.loginToken
        }
      });   
      let obj = response.data.user.favorites;
      currentUser.favorites = obj.map(s => new Story(s));    

      return obj;

  } catch(e) {
    console.debug(`Error - Could not remove favorite - Return code: ${e}`);
    return 0;
  }
}

function toggleStoryFav(clickedStar) {
  const $star = clickedStar;

  $star.toggleClass("far");
  $star.toggleClass("fas");
}

/**
 * When clicked, can either call addFavorite or removeFavorite
 * depending if it is toggled on or off.
 * 
 * Toggle favorite icon on or off after clicked.
 */

$body.on("click", ".star", function(e) {
  const $star = $(this);
  if($star.children().hasClass("far")) {
    addFavorite($star);
  } else {
    removeFavorite($star);
  }

  toggleStoryFav($star.children());
})

/**
 * removeStory
 * 
 * Called when user clicks on trash-can icon. Removes a story
 * from the API and the currentUser Instance.
 * 
 * Returns the story ID of the removed Story.
 */

async function removeStory(clickedTrash) {
  try{
    const trash = clickedTrash.parent();
    const cStoryId = trash[0].id;
    
    const response = await axios.delete(
      `${BASE_URL}/stories/${cStoryId}`, 
      {
        params:
        {
          token: currentUser.loginToken
        }
      });   
  
    let obj = response.data.story.storyId;
    
    // Remove story from both User ownStories list and storyList instances
    let ind = currentUser.ownStories.findIndex((e) => e.storyId == obj);
    currentUser.ownStories.splice(ind, 1);
    
    ind = storyList.stories.findIndex((e) => e.storyId == obj);
    storyList.stories.splice(ind,1);
    
    return obj; 

  } catch(e) {
    console.debug(`Error - Could not remove story - Return code: ${e}`);
    return 0;
  }

}

/**
 * When clicked, call removeStory and remove the story from
 * the UI on the My Stories page.
 */

$body.on("click", ".trash-can", function(e) {
  const $trash = $(this);
//  console.debug($trash.children());

  removeStory($trash);
  $trash.parent().hide('slow', function() {
    $trash.parent().remove();
  });
})