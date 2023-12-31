"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
  if(currentUser != null) {
    checkFavs();
  }

}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="star hidden">
          <i class="far fa-star">
          </i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <hr>
      </li>
    `);
}

/**
 * A render method to render HTML for a Story written by User instance
 * - story: an instance of Story
 * 
 * This adds the ability to delete by putting a trash-can span element
 * on the story li as well.
 *
 * Returns the markup for the story.
 */

function generateMyStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="trash-can">
          <i class="fas fa-trash-alt">
          </i>
        </span>
        <span class="star hidden">
          <i class="far fa-star">
          </i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <hr>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
//  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
    $stars = $('.star');
  }

  $allStoriesList.show();
}

/** Adds stories when the user submits them from the form */

async function addUserStory(evt) {
  evt.preventDefault();  
//  console.debug("addUserStory");
  const $title = $("#create-title").val();
  const $author = $("#create-author").val();
  const $url = $("#create-url").val();
  const story = {
    title: $title,
    author: $author,
    url: $url
  }  
  
//  console.debug(`${$title} - ${$author} - ${$url}`);

  await storyList.addStory(currentUser, story);
  putStoriesOnPage();
  $submitForm.hide("slow");

  $("#create-title").val("");
  $("#create-author").val("");
  $("#create-url").val("");

  $stars.show();
  checkFavs();  
}

$body.on("submit", "#submit-form", addUserStory);
