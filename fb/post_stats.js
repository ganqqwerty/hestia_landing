/*
 * this script gets the statistics of people who liked or commented my posts in fb
 * it produces the following table:
 * | Name | facebook page | Number of likes | Number of comments | Likes/Comments in groups |
 */
window.addEventListener(
    "unhandledrejection",
    function handleRejection( event ) {
        // Prevent the default behavior, which is logging the unhandled rejection
        // error to the console.
        // --
        // NOTE: This is only meaningful in Chrome that supports this event.
        event.preventDefault();
        console.group( "UNHANDLED PROMISE REJECTION" );
        console.log( event.reason );
        console.log( event.promise );
        console.groupEnd();
    }
);

function getPostId(url) {
    let regex = /https:\/\/www\.facebook\.com\/groups\/(.*?)\/permalink\/(.*?)\//i;
    let regexres = url.match(regex);
    if (regexres) {
        return regexres[2];
    }
    return null;
}

function getLikes(postId) {
    return new Promise((resolve, reject) => {
        setTimeout(x =>  {FB.api(
            '/' + postId + '/likes',
            function(response) {
                if (response && !response.error) {
                    return resolve(response);
                }
                return reject(new Error('Failed getting likes for ' + postId));

            }
        )}  , 1000);

    });

}

function getPersonInfo(personId) {

}

function aggregateResults() {

}

function getUserDetails(userId) {
    return new Promise((resolve, reject) => {
        FB.api(
            '/' + userId,
            'GET',
            {fields: 'id,first_name,last_name'}, //also need age_range,about,gender,location,relationship_status,work
            function (response) {
                resolve(response);
            }
        );
    });
}

function getLikedUsersInfo(postId) {
    return getLikes(postId)
        .then(res => {
            // console.log(res);
            return res.data.map(u => {
                if (u && u.id) {
                    return u.id
                }
                return null;
            });

        })
        .then(users => users.filter(u => u!==null).map(u => getUserDetails(u)))
        .then(usersPromises => Promise.all(usersPromises));
    // .then(resolvedPromises => console.log(resolvedPromises))
}


/**
 * retur
 * @param postIds string[]
 */
function getLikeAnalysis(postIds) {

    const likedUserInfoPromises = postIds.map(getLikedUsersInfo);
    Promise.all(likedUserInfoPromises)
        .then(likedUserInfos => flatten(likedUserInfos))
        .then(console.log)
        .catch(e => console.log(e))


}

function flatten(arrArr) {
    return arrArr.reduce(function (a, b) { //flatten the array
        return a.concat(b);
    }, []);
}

function process() {
    const postsUrls = document.getElementById("posts_urls").value.split(/\n/);
    const postsIds = postsUrls.map(getPostId).filter(x=>x!=null);
    getLikeAnalysis(postsIds);

}