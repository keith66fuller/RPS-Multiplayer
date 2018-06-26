document.addEventListener('DOMContentLoaded', function () {
    const config = {
        apiKey: "AIzaSyAYzgy54TZKLrt6zYFk56s6O47d9Ciu180",
        authDomain: "week7hw-65147.firebaseapp.com",
        databaseURL: "https://week7hw-65147.firebaseio.com",
        projectId: "week7hw-65147",
        storageBucket: "",
        messagingSenderId: "230237557865"
    };
    firebase.initializeApp(config);


    try {
        let app = firebase.app();
        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        console.log(`Firebase SDK loaded with ${features.join(', ')}`)
    } catch (e) {
        console.error(e);
        console.log('Error loading the Firebase SDK, check the console.')
    }


    const db = firebase.database();
    // const game = db.collection('rpsGame').doc('global');
    const connectionsRef = db.ref("/connections");
    const connectedRef = db.ref(".info/connected");


    db.ref().on('value', (snapshot) => {
        console.log(`IN PROGRESS: ${snapshot.val().inProgress}`)

        if (snapshot.val().inProgress) {

        } else {
            // $('#p1_name').empty().text("Waiting for Player FOO")
            // <input type="text" name="name" id="name" placeholder="Name">
            // <button>Start</button>
            $('#welcome').empty()
                .append(
                    $('<input type="text" name="playerName" id="playerName" placeholder="Name">')
                )
                .append(
                    $('<button id="startButton">').text("Start")
                )
        }
    })

    db.ref('/global/inProgress').on('value', function (snapshot) {
        console.log(`CHANGED: ${snapshot.val()}`)
    });

    db.ref('/global/inProgress').once('value').then(function (snapshot) {
        console.log(`SNAPSHOT: ${JSON.stringify()}`)
        console.log(`IN PROGRESS: ${snapshot.val()}`)
    });

    connectionsRef.on("value", function (snap) {

        // Display the viewer count in the html.
        // The number of online users is the number of children in the connections list.
        $("#watchers").text(snap.numChildren());
    });


    $('#welcome').on('click', '#startButton', (e) => {
        console.log('START')
        // game.get()
        // .then(doc => {
        //     let data = doc.data;
        //     console.log(1,data.p1_name);
        //     console.log(2,data.p2_name);
        //     if (!data.p1_name) {
        //         db.ref().set({
        //             p1_name: $('#playerName').val()
        //         }).then(function() {
        //             console.log("Document successfully updated!");
        //         })
        //         .catch(function(error) {
        //             // The document probably doesn't exist.
        //             console.error("Error updating document: ", error);
        //         });
        //     } else if (!data.p2_name) {
        //         db.ref().set({
        //             p2_name: $('#playerName').val(),
        //             inProgress: true
        //         }).then(function() {
        //             console.log("Document successfully updated!");
        //         })
        //         .catch(function(error) {
        //             // The document probably doesn't exist.
        //             console.error("Error updating document: ", error);
        //         });
        //     }
        // })
        console.log($('#playerName').val())
    });














});