
var Loremfill = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin pharetra nonummy pede. Mauris et orci. Aenean nec lorem. In porttitor. Donec laoreet nonummy augue. Suspendisse dui purus, scelerisque at, vulputate vitae, pretium mattis, nunc. Mauris eget neque at sem venenatis eleifend. Ut nonummy.';

function fillForm(id){
    var d = Loremfill;
    for(var c=0; c<5; c++){
        var d = d + `<br> <br>` + Loremfill;
        // console.log(d);
    }
    // console.log(d);
    document.getElementById(id).innerHTML = d;

}


function reply(){
    console.log("I tried")
}

function upload(){
    console.log("upload called");
}
//popup for pdf's
$(document).ready(function () {
    $(".popup").hide();
    $(".openpop").click(function (e) {
        e.preventDefault();
        $(".myI").attr("src", $(this).attr('href'));
        $(".links").fadeOut('slow');
        $(".popup").fadeIn('slow');
    });
    $(".close").click(function () {
        $(this).parent().fadeOut("slow");
        $(".links").fadeIn("slow");
    });
});

function submitForm(e) {
    e.preventDefault();
    const major = document.getElementById("major");
    const course = document.getElementById("course");
    const file = document.getElementById("pdf_file");
    const formData = new FormData();
    formData.append("major", major.value);
    formData.append("course", course.value);
    formData.append("pdf_file", file.files[0]);
    console.log("this is formdata: ",formData,major.value,course.value,file.files)
    fetch("upload", {
        method: 'post',
        body: formData,
    })
    .then((res) => console.log(res))
    .catch((err) => ("Error occured", err))
    .finally();
        
    $('#myModupload').modal('toggle');
    console.log("major: ",major,",course: ",course,",files: ",file[0])

    // if(major && course && file[0] != undefined){
        console.log("inside the reset")
        $('#mybut').click(
            setTimeout(()=> { 
                window.location.reload();
            }, 2000)
            // window.location.reload();
        );
    // }
};

const form = document.getElementById("Myform");
// if(form){
//     form.addEventListener("submit", submitForm);
// }

