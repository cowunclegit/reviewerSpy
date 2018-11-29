var request = require('request');
var async = require('async');
var sys = require('util');

var config = {
crucibleURL : "http://test1:123456@127.0.0.1:8060/",
spyMonth : 11
};

function crucibleSpy(){
    console.log("Start spy");

    var options = {
        url: config.crucibleURL + "rest-service/reviews-v1",
        headers: {
          'accept': 'application/json'
        }
      };
    request.get(options, function (error, response, body) {
        var reviewer = {};
        if(error){
            console.log("Error : " + error);
        }
        else{
            var reviewLists = JSON.parse(body);
            console.log("Review Lists!\n" + sys.inspect(reviewLists));

            async.forEachOf(reviewLists.reviewData, (value, key, callback) => {
                console.log(sys.inspect(value.author.userName));
                console.log(sys.inspect(value.moderator));
                console.log(sys.inspect(value.creator));
                console.log(sys.inspect(value.createDate));
                var createTime = new Date(value.createDate);
                var dueDate = new Date(value.dueDate);
                console.log(createTime.getMonth() + 1);
                console.log(dueDate.getMonth() + 1);
                console.log(sys.inspect(value.permaId));

                if(createTime.getMonth() + 1 == config.spyMonth || dueDate.getMonth() + 1 == config.spyMonth){
                    if(reviewer[value.author.userName] == null){
                        reviewer[value.author.userName] = 1;
                    }
                    else{
                        reviewer[value.author.userName]++;
                    }

                    if(reviewer[value.moderator.userName] == null){
                        reviewer[value.moderator.userName] = 1;
                    }
                    else{
                        reviewer[value.moderator.userName]++;
                    }

                    if(reviewer[value.creator.userName] == null){
                        reviewer[value.creator.userName] = 1;
                    }
                    else{
                        reviewer[value.creator.userName]++;
                    }

                    var getReviewOpt = {
                        url: config.crucibleURL + "rest-service/reviews-v1/" + value.permaId.id + "/reviewers",
                        headers: {
                            'accept': 'application/json'
                        }
                    }
                    request.get(getReviewOpt, function (error, response, body) {
                        if(error){
                            console.log("Error : " + error);
                        }
                        var reviewers = JSON.parse(body);
                        console.log("Reviewers!\n" + sys.inspect(reviewers));
                        for(var i=0;i<reviewers.reviewer.length;i++){
                            console.log("Reviews! = " + reviewers.reviewer[i].userName);
                            if(reviewer[reviewers.reviewer[i].userName] == null){
                                reviewer[reviewers.reviewer[i].userName] = 1;
                            }
                            else{
                                reviewer[reviewers.reviewer[i].userName]++;
                            }
                        }   
                        callback();
                    });
                }
                else{
                    callback();
                }
            }, function (err) {
                if (err){
                     console.error(err.message);
                    // configs is now a map of JSON data
                    console.log("Error to do loop!");
                }
                else{
                    console.log(reviewer);
                }
            });
        }
    });
}

crucibleSpy();
