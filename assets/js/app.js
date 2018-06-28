document.addEventListener('DOMContentLoaded', function () {
    const game = {
        Rock: 2,
        Scissors: 1,
        Paper: 0
    }

    const player = {
        name: null,
        win: 0,
        lose: 0,
        draw: 0,
        slot: null
    };

    let otherPlayer;

    firebase.initializeApp({
        apiKey: "AIzaSyBlpgyV1NYKnitdSRUCP83Bb1Sl6qWqEQ0",
        authDomain: "multiplayer-rockpaperscissors.firebaseapp.com",
        databaseURL: "https://multiplayer-rockpaperscissors.firebaseio.com",
        projectId: "multiplayer-rockpaperscissors",
        storageBucket: "multiplayer-rockpaperscissors.appspot.com",
        messagingSenderId: "456807530612"
    });


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

    dbRef.update({ turn: 0 });

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

    // Player takes a turn
    $('.gameButton').on('click', function () {
        console.log($(this).text())
        console.log($(this).parent().prop('id'))
        let playerNum = $(this).prop('id').toString().match(/^p(.)/)[1]
        console.log(`player ${playerNum} ${player.slot}`)
        if (playerNum == player.slot) {
            dbRef.child('players').child(playerNum).update({ choice: $(this).text() })
            player.choice = $(this).text();
            $(`.${player.slot}.gameButton`).hide();
            $(this).replaceWith(
                $('<h1>').text($(this).text())
            ).show();
            dbRef.child('turn').transaction((turn) => {
                console.log(`TURN: ${turn}`)

                if (turn == 2) {
                    console.log(`${player.name} chose ${player.choice}`);
                    console.log(`${otherPlayer.name} chose ${otherPlayer.choice}`);
                    let p = game[player.choice];
                    let o = game[otherPlayer.choice];
                    let winner;
                    if (Math.abs(p - o) > 1) {
                        winner = (o > p)
                    } else {
                        winner = (p > 0)
                    }

                    console.log(`Winner is ${winner}`)

                    let winnerName = winner ? player.name : otherPlayer.name

                    dbRef.update({ winner: winnerName })
                }





                return ++turn;
            });
        }
    });


    db.ref('winner').once('value', snapshot => {
        // db.ref('winner').off();
        console.log(`103 Winner is ${snapshot.val()}`);
        if (snapshot) {
            db.ref('winner').remove().then(() => {
                console.log(`Winner is ${snapshot.val()}`);
                $('#winner').append($('<h1>').text(snapshot.val()));
            })
        }
    });

    db.ref('turn').on('value', turn => {
        turn = JSON.stringify(turn)
        if (turn) {
            if (turn == 3) {

            } else if (turn == player.slot) {
                $('#gameMsg').text("It's Your Turn!");
            } else {
                if (otherPlayer) {
                    $('#gameMsg').text(`Waiting for ${otherPlayer.name} to choose.`);
                } else { }
                $('#gameMsg').text(`Waiting for the other player to choose.`);
            }
        }
    });



    // Event fires on IPL and whenever *anything* in the db changes.
    db.ref('players').on('value', (snapshot) => {

        // If DB has another player, make a local copy of him.
        if (player.slot) {
            if (snapshot.child(player.slot % 2 + 1).exists()) {
                console.log(`I am player ${player.slot} and there is a player ${player.slot % 2 + 1}`)
                otherPlayer = snapshot.child(player.slot % 2 + 1).val();
                console.log('Here he is ' + JSON.stringify(otherPlayer))
            }
        }

        // page elements for this player.
        [1, 2].forEach(num => {
            let name = snapshot.child(`${num}/name`).val();
            if (player.slot == num) {
                if (snapshot.child(num).exists()) {
                    $('#welcome').empty()
                        .append(
                            $('<h3>').text(`Hi ${name}!  You are Player ${num}`)
                        )
                        .append(
                            $(`<h3 class="player${num}" id="gameMsg">`)
                        );
                } else {

                }
            } else if (!player.slot) {
                // Intially show the login form
                $('#welcome').empty()
                    .append(
                        $('<input type="text" name="playerName" id="playerName" placeholder="Name">')
                    )
                    .append(
                        $('<button id="startButton">').text("Start")
                    )

            }
        });
        // page elements for both players
        [1, 2].forEach(num => {
            if (snapshot.child(num).exists()) {
                let name = snapshot.child(`${num}/name`).val();
                console.log(`Drawing player ${num} - ${name}`)
                $(`.${num}.nameTag`).text(name);
                if (snapshot.child(num).child('choice').exists()) {
                    // console.log(`Drawing choice ${snapshot.child(num).child('choice').val()}`)
                    // $(`.${num}.gameButton`).hide();
                    // $(`.${num}.gameButtons`).append(
                    //     $('<h4>').addClass(num).addClass('choice').text("CHOICE")
                    //     // snapshot.child(num).child('choice').val()
                    // );
                } else {
                    $(`.${num}.choice`).remove();
                    $(`.${num}.gameButton`).show();
                }
                $(`.${num}.stats`).show();
            } else {
                $(`.${num}.nameTag`).text(`Waiting for Player ${num}`)
                $(`.${num}.gameButton`).hide();
                $(`.${num}.stats`).hide();
            }
        });

    });


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
            player.slot = snapshot.hasChild('players/1') + snapshot.hasChild('players/2') + 1;
            console.log(`Slot will be ${player.slot}`)
        }).then(() => {
            dbRef.child(`players/${player.slot}`).set({
                name: player.name,
                win: 0,
                lose: 0,
                draw: 0,
                slot: player.slot
            })
                .catch(e => {
                    console.log(e);
                })
                .then(() => {
                    if (player.slot == 2) {
                        dbRef.child('turn').transaction(turn => {
                            return (turn == 0) ? 1 : turn;
                        }, (err, commit, turn) => {
                            console.log(`TURN IS NOW ${turn}`);
                            console.log(JSON.stringify(turn))

                        });
                    }
                })
        })
    });














});