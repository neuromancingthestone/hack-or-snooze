"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
//  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
  if(currentUser != null) {
    checkFavs();    
    $stars.show();
  }
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
//  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
//  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function submitFormClick(evt) {
  hidePageComponents();  
//  console.debug("submitFormClick", evt);
  $submitForm.show();
}

$body.on("click", "#nav-submit-story", submitFormClick);

function showFavoriteStories(evt) {
  $favoritesList.empty();  
  hidePageComponents();
  $favoritesList.show();
  // loop through all of our favorite stories and generate HTML
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoritesList.append($story);
    $favListStars = $favoritesList.find('.star');
//    console.debug($favoritesList.find('.star'));
  }
  $favListStars.show();
  $favListStars.find(".fa-star").toggleClass("fas");
  $favListStars.find(".fa-star").toggleClass("far");
//  console.debug("showFavoriteStories", evt);
}

$body.on("click", "#nav-favorites", showFavoriteStories);

function showMyStories(evt) {
//  console.debug("showMyStories");
  $myStoryList.empty();  
  hidePageComponents();
  $myStoryList.show();

  // loop through all of our favorite stories and generate HTML
  for (let story of currentUser.ownStories) {
    const $story = generateMyStoryMarkup(story);
    $myStoryList.append($story);
  }
}

$body.on("click", "#nav-my-stories", showMyStories);
