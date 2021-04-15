
var tour = new Tour({
    steps: [
    {
        element: "#about_me",
        title: "Main information",
        content: "Look here for all your about me section.",
        placement: "auto"
    },
    {
        element: "#note",
        title: "Main information",
        content: "Look here for all your notes section.",
        placement: "auto"
    },
    {
        element: "#message",
        title: "Main information",
        content: "Look here for all your messages section.",
        placement: "auto"
    },
    {
        element: "#nsnavbar",
        title: "Site navigation",
        content: "You can look here to logout and edit profile.",
        placement: "bottom"
    },
    {
        element: "#profile_info",
        title: "User information",
        content: "Here is all your user information",
        placement: "auto"
    },
    {
        element: "#upload",
        title: "User information",
        content: "Here you can upload Pdf's for you and others.",
        placement: "auto"
    },
    ], backdrop:true, 
    // debug:true,
});

// $(document).ready(function(){
    // Initialize the tour
    // tour.init();

    // Start the tour
    // tour.start();
    // $("#Tour").click(tour.start);
    $("#Tour").click(function (){tour.restart();});  
// });
