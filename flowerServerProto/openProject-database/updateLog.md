Problems/Goals: 

A. Create a function that randomizes player and object placement so that there is no overlap. (20230101)

B. The players from other sessions are not appearing on the main session unless the browser is refreshed. (20230101)

C. After receiving the 'guestPlayer' from the server (newPlayer), starting the game adds both an otherPlayer and a mainPlayer to the activePlayers array. (20230101)

    1. Added splice and remove to the otherPlayer 'if' statement => the activePlayers array now contains a duplicate socket.id with different element ids. (20230101)

    2. **The extra player is added as if it is a new player, despite a different element already having the same id
