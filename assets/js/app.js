document.addEventListener('DOMContentLoaded', function () {
    let slot;
    const playerNums = [1, 2];
    const config = {
        apiKey: "AIzaSyBlpgyV1NYKnitdSRUCP83Bb1Sl6qWqEQ0",
        authDomain: "multiplayer-rockpaperscissors.firebaseapp.com",
        databaseURL: "https://multiplayer-rockpaperscissors.firebaseio.com",
        projectId: "multiplayer-rockpaperscissors",
        storageBucket: "multiplayer-rockpaperscissors.appspot.com",
        messagingSenderId: "456807530612"
    };

    firebase.initializeApp(config);

    const player = {
        name: null,
        win: 0,
        lose: 0,
        slot: null
    }

    try {
        let app = firebase.app();
        let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
        console.log(`Firebase SDK loaded with ${features.join(', ')}`)
    } catch (e) {
        console.error(e);
        console.log('Error loading the Firebase SDK, check the console.')
    }


    const db = firebase.database();
    const dbRef = db.ref();
    const connectionsRef = db.ref("/connections");
    const connectedRef = db.ref(".info/connected");


    // initialize database

    let players = db.ref('players');

    console.log(`PLAYERS: ${players}`)

    pRef = players.child('1')

    console.log(`QUERY: ${pRef.orderByKey()}`)

    db.ref().on('value', (snapshot) => {
        playerNums.forEach(num => {
            console.log(`NUM ${num}`)
            if (snapshot.child(`players/${num}`).exists()) {
                console.log("EXISTS")
                let name = snapshot.child(`players/${num}/name`).val();
                $(`#${num}.nameTag`).text(name)
                $(`#player${num} .gameButton`).show();
                $(`#player${num} .stats`).show();

            } else {
                console.log("NOT EXISTS")
                $('#welcome').empty()
                .append(
                    $('<input type="text" name="playerName" id="playerName" placeholder="Name">')
                )
                .append(
                    $('<button id="startButton">').text("Start")
                )
        
                $(`#${num}.nameTag`).text(`Waiting for Player ${num}`)
                $(`#player${num} .gameButton`).hide();
                $(`#player${num} .stats`).hide();
            }
        });



        // if (snapshot.val().inProgress) {
        //     // $('#p2_name').empty().text("Waiting for Player FOO")
        //     // <input type="text" name="name" id="name" placeholder="Name">
        //     // <button>Start</button>
        //     $('#welcome').empty()
        //         .append(
        //             $('<input type="text" name="playerName" id="playerName" placeholder="Name">')
        //         )
        //         .append(
        //             $('<button id="startButton">').text("Start")
        //         )
        // }
    })

    // db.ref('/global/inProgress').on('value', function (snapshot) {
    //     console.log(`CHANGED: ${snapshot.val()}`)
    // });

    // db.ref('/global/inProgress').once('value').then(function (snapshot) {
    //     console.log(`SNAPSHOT: ${JSON.stringify()}`)
    //     console.log(`IN PROGRESS: ${snapshot.val()}`)
    // });

    // function setPlayerName(playerNum) {
    //     let args = {};
    //     args[`p${playerNum}_name`] = $('#playerName').val();
    //     db.ref().update(args).then(function () {
    //         console.log("Document successfully updated!");
    //     })
    //         .catch(function (error) {
    //             // The document probably doesn't exist.
    //             console.error(`Error updating document for player ${playerNum}: `, error);
    //         });
    // }

    // Event fires when user clicks Start after having put in his name.
    $('#welcome').on('keyup', '#playerName', (e) => {
        event.preventDefault();
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Trigger the button element with a click
            document.getElementById("startButton").click();
        }
    })
    $('#welcome').on('click', '#startButton', (e) => {
        player.name = $('#playerName').val();
        dbRef.once('value', snapshot => {
            if (!snapshot.hasChild('players')) {
                player.slot = 1;
            } else if (!snapshot.child('players/2').exists()) {
                player.slot = 2;
            }

        }).then(() => {
            dbRef.child('players').child(player.slot).set({
                name: player.name,
                win: 0,
                lose: 0
            })
            .catch(e => {
                console.log(e);
            });
            console.log('HERE')
            $('#welcome').empty()
            .append(
                $('<h3>').text(`Hi ${player.name}!  You are Player ${player.slot}`)
            )
            .append(
                $('<h3 id="gameMsg">')
            );
        })






        // db.ref().once('value').then(function (snapshot) {
        //     console.log(`SNAPSHOT: ${JSON.stringify()}`)
        //     console.log(`IN PROGRESS: ${snapshot.val().inProgress}`)
        //     if (!snapshot.val().p2_name) {
        //         setPlayerName(1)
        //     } else if (!snapshot.val().p2_name) {
        //         setPlayerName(2)
        //     }
        //     console.log($('#playerName').val())
        // });
    });














});