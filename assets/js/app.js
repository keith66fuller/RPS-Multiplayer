document.addEventListener('DOMContentLoaded', function () {
    const player = {
        name: "",
        win: 0,
        lose: 0,
        draw: 0
    }




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
        // ['1','2'].forEach(playerNum => {
        //     $('#'+playerNum+'.nameTag').text((snapshot.val()['p1_name'] != "") ? snapshot.val()[snapshot.val()['p1_name']] : `Waiting for Player ${playerNum}`)
        // });
        $('#1.nameTag').text((snapshot.val().p1_name != "") ? snapshot.val().p1_name : "Waiting for Player 1")
        $('#2.nameTag').text((snapshot.val().p2_name != "") ? snapshot.val().p2_name : "Waiting for Player 2")

        if (snapshot.val().inProgress) {
            // $('#p2_name').empty().text("Waiting for Player FOO")
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

    function setPlayerName(playerNum) {
        let args = {};
        args[`p${playerNum}_name`] = $('#playerName').val();
        db.ref().update(args).then(function () {
            console.log("Document successfully updated!");
        })
            .catch(function (error) {
                // The document probably doesn't exist.
                console.error(`Error updating document for player ${playerNum}: `, error);
            });
    }

    // Event fires when user clicks Start after having put in his name.
    $('#welcome').on('click', '#startButton', (e) => {
        console.log('START')
        db.ref().once('value').then(function (snapshot) {
            console.log(`SNAPSHOT: ${JSON.stringify()}`)
            console.log(`IN PROGRESS: ${snapshot.val().inProgress}`)
            if (!snapshot.val().p2_name) {
                setPlayerName(1)
            } else if (!snapshot.val().p2_name) {
                setPlayerName(2)
            }
            console.log($('#playerName').val())
        });
    });














});