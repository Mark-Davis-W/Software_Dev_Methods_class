
var tour = new Tour({
    steps: [
    {
        element: "#fileTabs",
        title: "Main information",
        content: "Look here for all your needs for the website.",
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
