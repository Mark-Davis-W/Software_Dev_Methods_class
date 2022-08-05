
function makeApiCall(){
    var numImages = document.getElementById("num_images").value;
    var searchTerm = document.getElementById("s_term").value;
    if(numImages>0 && searchTerm){
        // console.log("I was called")
        var key = "f587bc26cf3bf260fff268022ca0a82c";
        $(document).ready(function() {
            //Place your Flickr API Call Here
            var url = `https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key=${key}&tags=${searchTerm}&tag_mode=anyprivacy_filter=1&safe_search=1&extras=url_o,url_sq&per_page=${numImages}&format=json&nojsoncallback=1`
            // "https://www.flickr.com/services/rest/?method=flickr.photos.search&api_key={key}&tags={tag}&tag_mode={tag_mode}&privacy_filter=&safe_search=&content_type=&extras=url_o&per_page={number}&format={return_format}&nojsoncallback=1"
            
            $.ajax({url:url, dataType:"json"}).then(function(data) {
                console.log(data);//Review all of the data returned
                // console.log(data.photos)
                // console.log("i tried")
                var img = `<div class='card-deck pb-3 text-center justify-content-center'>`;

                for(var i = 0; i < numImages; i++){
                    if(data.photos.photo[i].url_o && data.photos.photo[i].url_sq && data.photos.photo[i].title){
                        img += `
                                <div class="card mb-5 shadow" style="border-color: blueviolet; border-width: medium; overflow-y: auto; min-width: 18rem; max-width: 18rem; max-height: 19rem;">
                                    <div class="card-body px-3">
                                        <a href='${data.photos.photo[i].url_o}'>
                                            <img class='card-img' src='${data.photos.photo[i].url_sq}' alt='${data.photos.photo[i].title}' style='width:220px;height:220px'></img><br>
                                        </a>
                                        <p class ='card-title font-weight-bold'> ${data.photos.photo[i].title} </p>
                                    </div>
                                </div>
                                `;
                    }
                }
                console.log(img)
                img += `</div>`;
                document.getElementById("images").innerHTML = img;
            })
        })
    }else{
        alert("Your query is invalid. Please try again.")
    }
    // document.getElementById("myF").reset();
};

document.getElementById("myF").addEventListener('keypress', function(e) {
    if (e.key ==='Enter'){
        e.preventDefault();
        e.stopImmediatePropagation();
        makeApiCall();
        document.getElementById("myF").removeEventListener('keypress',this.document);
    }
});
