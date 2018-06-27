document.addEventListener('DOMContentLoaded', function () {
    var fbSuppress = false;

    const game = {
        Rock: 2,
        Scissors: 1,
        Paper: 0
    }
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
        draw: 0,
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


    window.addEventListener("beforeunload", function (event) {
        console.log(`Before Unload ${event}`)
        console.log(JSON.stringify(player))
        if (player.slot) {
            db.ref(`players/${player.slot}`).remove()
                .then(function () {
                    console.log("Remove succeeded.")
                })
                .catch(function (error) {
                    console.log("Remove failed: " + error.message)
                });
        }
    });

    $('.gameButton').on('click', function () {
        console.log($(this).text())
        console.log($(this).parent().prop('id'))
        let playerNum = $(this).parent().prop('id').toString().replace('player', '')
        console.log(`player ${playerNum} ${player.slot}`)
        if (playerNum == player.slot) {
            dbRef.child('players').child(playerNum).update({ choice: $(this).text() })
                .then(e => {
                    console.log(`60 ${e}`)
                })
                .catch(e => {
                    console.log(`63 ${e}`)
                })
        }
    })

    db.ref().on('value', (snapshot) => {
        if (fbSuppress) {
            fbSuppress = false;
            return;
        }
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
            if (snapshot.child(`players/1`).exists() && snapshot.child(`players/2`).exists()) {
                console.log(snapshot.child('players/1/choice').val() + ' ' + snapshot.child('players/2/choice').val())
                let choice = {}
                if (snapshot.child('players/1/choice').val() && snapshot.child('players/2/choice').val()) {
                    choice[1] = game[snapshot.child('players/1/choice').val()]
                    choice[2] = game[snapshot.child('players/2/choice').val()]

                    if (choice[1] == choice[2]) {
                        [1, 2].forEach(num => {
                            dbRef.child(`players/${num}/choice`).transaction(() => {
                                return null;
                            }, null, false);
                        });

                        [1, 2].forEach(num => {
                            console.log(`NUM 105: ${num}`)
                            firebase.database().ref(`players/${num}/draw`).transaction((draws) => {
                                fbSuppress = true;
                                return ++draws;
                            }, null, false);

                        })
                    }
                }
            }
        });
    })


    // Event fires when user clicks Start after having put in his name.
    $('#welcome').on('keyup', '#playerName', (e) => {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("startButton").click();
        }
    })
    $('#welcome').on('click', '#startButton', (e) => {
        player.name = $('#playerName').val();
        dbRef.once('value', snapshot => {
            if (!snapshot.hasChild('players/1')) {
                player.slot = 1;
            } else if (!snapshot.child('players/2').exists()) {
                player.slot = 2;
            }

        }).then(() => {
            dbRef.child('players').child(player.slot).set({
                name: player.name,
                win: 0,
                lose: 0,
                draw: 0
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