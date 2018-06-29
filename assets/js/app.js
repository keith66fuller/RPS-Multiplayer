document.addEventListener('DOMContentLoaded', function () {

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
    const game = {
        Rock: 2,
        Scissors: 1,
        Paper: 0
    }

    const testGame = {
        2: 'Rock',
        1: 'Scissors',
        0: 'Paper'
    }

    const player = otherPlayer = {
        name: null,
        win: 0,
        lose: 0,
        draw: 0,
        slot: null
    };

    for (let p = 0; p < 3; p++) {
        for (let o = 0; o < 3; o++) {
            console.log(testGame[p], testGame[o], ((p != o) ? (Math.abs(p - o) > 1) ? (o > p) : (p > o) : 0))
        }
    }


    dbRef.update({
        turn: 0
    });

    // Page refresh or navigation will remove your player and set the turn to 0 - waiting for players.
    window.addEventListener("beforeunload", function (event) {
        if (player.slot) {
            db.ref(`players/${player.slot}`).remove()
                .then(function () {
                    // console.log("Remove succeeded.")
                })
                .catch(function (error) {
                    // console.log("Remove failed: " + error.message)
                });
        }
    });

    // Fires at the start of a new turn
    db.ref('turn').on('value', turn => {
        turn = parseInt(JSON.stringify(turn));
        switch (turn) {
            case 0:
                console.log('GAME RESET');
                $('.winMsg').remove();
                $('.playerChoice').remove();
                $('.gameButton').show();
                player.choice = "";
                otherPlayer.choice = "";
                //CONTROLLER ONLY
                if (player.slot == 1) {
                    dbRef.update({
                        turn: 1
                    })
                }
                break;
            case player.slot:
                $('#gameMsg').text("It's Your Turn!");
                break;
            case 3:
                //After two seconds, reset the game so players can go again.
                //CONTROLLER ONLY
                if (player.slot == 1) {
                    setTimeout(() => {
                        dbRef.update({
                            turn: 0
                        });
                    }, 2000)
                }

                break;
            default:
                if (otherPlayer) {
                    $('#gameMsg').text(`Waiting for ${otherPlayer.name} to choose.`);
                } else {
                    $('#gameMsg').text(`Waiting for the other player to choose.`);
                };
                break;
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

        // After having local copies, remove their choices.
        player.choice = "";
        otherPlayer.choice = "";

        //Update player stats from our local copies of the players
        if (player.slot) {
            $(`.${player.slot}.stat_w`).text(player.win);
            $(`.${player.slot}.stat_l`).text(player.lose);
            $(`.${player.slot}.stat_d`).text(player.draw);
        }
        if (otherPlayer.slot) {
            $(`.${otherPlayer.slot}.stat_w`).text(otherPlayer.win);
            $(`.${otherPlayer.slot}.stat_l`).text(otherPlayer.lose);
            $(`.${otherPlayer.slot}.stat_d`).text(otherPlayer.draw);
        }

        // page elements for this player.
        [1, 2].forEach(num => {
            if (player.slot == num) {
                if (snapshot.child(num).exists()) {
                    $('#welcome').empty()
                        .append(
                            $('<h3>').text(`Hi ${snapshot.child(`${num}/name`).val()}!  You are Player ${num}`)
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

            // Show players names or placeholder
            if (snapshot.child(num).exists()) {
                let name = snapshot.child(`${num}/name`).val();
                $(`.${num}.nameTag`).text(name);
                if (snapshot.child(num).child('choice').exists()) {} else {
                    $(`.${num}.choice`).remove();
                    $(`.${num}.gameButton`).show();
                }
                $(`.${num}.stats`).show();
            } else {
                $(`.${num}.nameTag`).text(`Waiting for Player ${num}`)
                $(`.${num}.gameButton`).hide();
                $(`.${num}.stats`).hide();
            }

            //Show players' choices
            [1, 2].forEach(num => {
                if (snapshot.child(`${num}/choice`).exists()) {
                    if (snapshot.child(`${num}/choice`).val() != "") {
                        if (!$(`.${num}.playerChoice`).length) {
                            console.log(`Player ${num} choice is ${snapshot.child(`${num}/choice`).val()}`)
                            console.log('LENGTH: ' + $(`.${num}.playerChoice`).length)
                            $(`.${num}.gameButton`).hide();
                            $(`.${num}.gameButtons`).append(
                                $('<h1>').addClass(`${num} playerChoice`).text(
                                    snapshot.child(`${num}/choice`).val()
                                )
                            );
                        }
                    }
                } else {
                    $(`h1.${num}.playerChoice`).remove();
                    $(`.${num}.gameButton`).show();
                }
            });






        });

    });

    // game over man
    db.ref('winner').on('value', snapshot => {
        console.log(`DB says winner is ${snapshot.val()}`)
        if (snapshot.val()) {
            let winner = snapshot.val();
            let winMsg = (winner != 0) ? (winner == player.slot) ? `${player.name} Wins!` : `${otherPlayer.name} Wins!` : "Tie Game!"
            console.log(`DB says winner is ${winner}`)
            $('#winner').append(
                $('<h1>').addClass('winMsg').text(winMsg)
            )
            // CONTROLLER ONLY
            if (player.slot == 1) {
                db.ref('winner').remove()
            }
        }
    })


    // Event fires when user hits ENTER  after having put in his name.
    $('#welcome').on('keyup', '#playerName', (e) => {
        event.preventDefault();
        if (event.keyCode === 13) {
            document.getElementById("startButton").click();
        }
    })
    // Event fires when user clicks Start after having put in his name.
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


    // Player takes a turn
    $('.gameButton').on('click', function () {
        let playerNum = $(this).prop('id').toString().match(/^p(.)/)[1]
        dbRef.child('turn').transaction((turn) => {
            // Your clicks out of turn or on the other guys buttons mean nothing.
            if (playerNum == player.slot && playerNum == turn) {
                player.choice = $(this).text();
                console.log(`PLAYER ${player.slot} CHOOSES ${player.choice}`)
                // Second turn decides the winner (duh)
                // Player 2 client-side always arbitrates the result.
                if (turn == 2) {
                    let p = game[player.choice];
                    let o = game[otherPlayer.choice];
                    let winner = (p != o) ? (Math.abs(p - o) > 1) ? (o > p) : (p > o) : 0

                    console.log(`RESULT: ${player.choice} ${otherPlayer.choice} --> ${winner}`)
                    // update our local player copy
                    player.win += winner;
                    player.lose += !winner;
                    player.draw += (p == o);

                    // update our local opponent copy
                    otherPlayer.win += !winner;
                    otherPlayer.lose += winner;
                    otherPlayer.draw += (p == o);

                    // Signal to db that game is over
                    dbRef.update({
                        winner: winner ? player.slot : otherPlayer.slot,
                        players: {
                            [player.slot]: {
                                name: player.name,
                                choice: player.choice,
                                slot: player.slot,
                                win: player.win,
                                lose: player.lose,
                                draw: player.draw
                            },
                            [otherPlayer.slot]: {
                                name: otherPlayer.name,
                                choice: otherPlayer.choice,
                                slot: otherPlayer.slot,
                                win: otherPlayer.win,
                                lose: otherPlayer.lose,
                                draw: otherPlayer.draw
                            }
                        }
                    })
                }
            }
            return ++turn;
        });

    });












});