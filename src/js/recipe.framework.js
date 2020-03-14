//client-side framework
class framework {
    
    static post(url, data, onCompletion) {
        
        framework.getToken(function(res,err) {
            if(err){
                console.log("Error Occured",err);
                return;
            }
            
            data.token = res.token;
            
             $.ajax({
                'url' : url,
                'type' : 'POST',
                'data' : data,
                'success' : function(data) {              
                    onCompletion(data,null)
                },
                'error' : function(request,error){
                    onCompletion(request,error)
                }
            });
        
            
        });
        
       
    }

    static get(url, data, onCompletion) {
        
        framework.getToken(function(res,err) {
            if(err){
                console.log("Error Occured",err);
                return;
            }
            
            data.token = res.token;
            
             $.ajax({
                'url' : url,
                'type' : 'GET',
                'data' : data,
                'success' : function(data) {              
                    onCompletion(data,null)
                },
                'error' : function(request,error){
                    onCompletion(request,error)
                }
            });
        
            
        });
        
       
    }
    
    static getToken(onCompletion) {
        
        var data = {}
        data.userId = "thook07@gmail.com"
        data.apiKey = "e6b6cb37-183d-4c41-b42f-57e31be79d1c";
        
        $.ajax({
            'url' : "http://3.14.147.18:1338/authenticate",
            'type' : 'POST',
            'data' : data,
            'success' : function(data) {              
                onCompletion(data,null)
            },
            'error' : function(request,error){
                onCompletion(request,error)
            }
        });
        
        
    }
    
    
    
    
}