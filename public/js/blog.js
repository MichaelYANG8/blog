var url = 'http://blog-huanjunwang.c9users.io/api/list?skip=';
var skip = 0;
$(document).ready(function(){
    
    $('#more').click(function(e){
        e.preventDefault();
        
        skip = $("div.post-preview").length;
        url += skip;
        
        $.getJSON(url,function(data){
            for(var i = 0; i < data.docs.length; i++){
                
                var post = data.docs[i];
                var html = "";
                
                html += "<div class='post-preview'>";
                html += "  <a href='/artical?id=" + post._id + "'>";
                html += "    <h2 class='post-title'>" + post.title + "</h2>";
                html += "    <h3 class='post-subtitle'>" + post.subtitle + "</h3>";
                html += "   </a>";
                html += "  <p class='post-meta'>";
                html += "     Posted by"
                html += "     <a href='/usr?id=" + post.name + "'>" + post.name + "</a>";
                html += "     on " + post.time.minute;
                html += "  </p>";
                html += "</div>";
                html += "<hr>";
            
                $("#postlist").append(html);
            }
            
            if(data.end){
                $("a#more").html("THE END");
               
            }
        });
        
    });
    
    
})