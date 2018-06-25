$("#scrape").on("click", function () {
  event.preventDefault();
  // console.log("scraped");
  $("#articles").empty();
  // Grab the articles as a json
  $.getJSON("/articles", function(data) {
      // For each one
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        console.log("append article");
        // If there's a note in the article
        if (data[i].note) {
          //view notes button
         var viewNotes = "<button class='viewNote' data-id='" + data[i]._id + "'>View Notes</button>";
        $("#articles").append("<p><button class='noteBtn' data-id='" + data[i]._id + "'>Add a note</button>" + viewNotes + "<br><a class='headline' href='" + data[i].link +"'>" + data[i].title + "</a><br/><p class='summary'>" + data[i].summary + "</p><br/><img class='thumbnail' src='" + data[i].image + "'></p><hr>");
      } else {
        $("#articles").append("<p><button class='noteBtn' data-id='" + data[i]._id + "'>Add a note</button><br><a class='headline' href='" + data[i].link +"'>" + data[i].title + "</a><br/><p class='summary'>" + data[i].summary + "</p><br/><img class='thumbnail' src='" + data[i].image + "'></p><hr>");
      }
    }
    });
  });


//TO SAVE NOTES
//on click add note button
$(document).on("click", ".noteBtn", function() {
  console.log("saving article - app.js");
$("#notes").empty();
    // Save the id from the btn tag
    var thisId = $(this).attr("data-id");
  
    // Now make an ajax call for the Article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    // With that done, add the note information to the page
      .then(function(data) {
        console.log(data);
//         // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
//         // An input to enter a new title
        $("#notes").append("Note Title: <input id='titleinput' name='title' ><br>");
//         // A textarea to add a new note body
        $("#notes").append("Note: <textarea id='bodyinput' name='body'></textarea>");
//         // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
      });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");
    console.log(thisId);
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      // With that done
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
        $("#notes").text("Your note has been saved!");
      });
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  
  // When you click the viewnote button
  $(document).on("click", ".viewNote", function() {
    $("#notes").empty();
      // Save the id from the button
      var thisId = $(this).attr("data-id");
     // Now make an ajax call for the Article
     $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
    .then(function(data) {
      console.log(data);


      // If there's a note in the article
      if (data.note) {
        // // Place the title of the note in the title input
        // $("#notes").html("<p>Note Title: " + data.note.title + "</p><br><p>Note: " + data.note.body + "</p>");

//         // The title of the article
$("#notes").append("<h2>" + data.title + "</h2>");
//         // An input to enter a new title
        $("#notes").append("Note Title: <input id='titleinput' name='title' value='" + data.note.title + "' ><br>");
//         // A textarea to add a new note body
        $("#notes").append("Note: <textarea id='bodyinput' name='body'>" + data.note.body + "</textarea>");
//         // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save your modifications</button>");
  
      }
    });
});