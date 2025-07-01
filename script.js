let players = []; // List of active player names
let imposters = new Set(); // Set of imposter names
let keyword = ""; // The secret keyword for civilians (e.g., "Word (Category)")
let revealed = {}; // Tracks which players have revealed their word { "PlayerName": { role: "Civilian", word: "Word (Category)" } }
let votes = {}; // Stores votes for the current round
let round = 1; // Current round number
let showImposterWhenKicked = false; // Option to reveal imposter role
let publicCategory = ''; // Global variable to store the category for public display

// Helper to shuffle an array (Fisher-Yates)
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// --- Game Setup Phase ---
function startNameEntry() {
    const num = parseInt(document.getElementById("numPlayers").value);
    const imp = parseInt(document.getElementById("numImposters").value);

    // Validate number of players and imposters
    if (isNaN(num) || num < 3 || num > 13) {
        alert("Please enter a number of players between 3 and 13.");
        return;
    }
    if (isNaN(imp) || imp < 1 || imp >= num) {
        alert("Please enter a valid number of imposters (at least 1, and less than the total players).");
        return;
    }
    // Prevent imposters being equal to or more than half of players
    if (imp >= Math.floor(num / 2)) {
        alert("Number of imposters cannot be equal to or greater than half the number of players.");
        return;
    }

    showImposterWhenKicked = document.getElementById("showImposter").checked;
    // Hide how-to-play note
    const howToPlayNote = document.getElementById("howToPlayNote");
    if (howToPlayNote) howToPlayNote.style.display = "none";

    // --- Start: Keyword generation/input logic (already present, but needs to determine publicCategory) ---
    let tempSelectedKeyword = ""; // Use a temporary variable for keyword determination
    publicCategory = ''; // Reset public category for each game

    const randomWordChecked = document.getElementById('randomWord').checked;
    const keywordInputValue = document.getElementById('keywordInput').value.trim();

    if (randomWordChecked) {
        tempSelectedKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        // Extract category for public display when a random word is picked
        const lastParenIndex = tempSelectedKeyword.lastIndexOf('(');
        const lastCloseParenIndex = tempSelectedKeyword.lastIndexOf(')');
        if (lastParenIndex !== -1 && lastCloseParenIndex !== -1 && lastCloseParenIndex > lastParenIndex) {
            publicCategory = tempSelectedKeyword.substring(lastParenIndex + 1, lastCloseParenIndex);
        }
        document.getElementById("keywordInput").value = "[Randomly Generated]"; // Display that it's random
        document.getElementById("keywordInput").disabled = true; // Disable input if random
    } else if (keywordInputValue) {
        // If "Generate random keyword" is NOT checked, and a custom input is provided.
        const customWords = keywordInputValue.split(',')
                                            .map(word => word.trim())
                                            .filter(word => word.length > 0);

        if (customWords.length === 0) {
            alert("No valid custom keyword(s) entered. Picking a random word from the general list.");
            tempSelectedKeyword = keywords[Math.floor(Math.random() * keywords.length)];
            // Extract category for fallback random word
            const lastParenIndex = tempSelectedKeyword.lastIndexOf('(');
            const lastCloseParenIndex = tempSelectedKeyword.lastIndexOf(')');
            if (lastParenIndex !== -1 && lastCloseParenIndex !== -1 && lastCloseParenIndex > lastParenIndex) {
                publicCategory = tempSelectedKeyword.substring(lastParenIndex + 1, lastCloseParenIndex);
            }
        } else if (customWords.length === 1) {
            tempSelectedKeyword = customWords[0];
        } else {
            tempSelectedKeyword = customWords[Math.floor(Math.random() * customWords.length)];
        }
        // For custom keywords, publicCategory remains empty as per your requirement.
        document.getElementById("keywordInput").disabled = false; // Ensure input is enabled if not random
    } else {
        alert("Please enter a keyword or choose to generate a random one.");
        return; // No keyword source, stop
    }

    keyword = tempSelectedKeyword; // Assign the determined keyword to the global 'keyword' variable
    // --- End: Keyword generation/input logic ---

    // Generate player name input fields
    const nameInputsDiv = document.getElementById("nameInputs");
    nameInputsDiv.innerHTML = "";
    for (let i = 0; i < num; i++) {
        nameInputsDiv.innerHTML += `<label>Player ${i + 1} Name: <input type='text' id='player${i}'></label>`;
    }

    // Transition to name entry
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("nameEntry").classList.remove("hidden");
    // Hide all other sections to prevent overlap
    document.getElementById("revealPhase").classList.add("hidden");
    document.getElementById("gameStart").classList.add("hidden");
    document.getElementById("votingPhase").classList.add("hidden");
    document.getElementById("results").classList.add("hidden");
    document.getElementById("discussionPhase").classList.add("hidden");
}

// --- Game Start & Role Assignment Phase ---

function startGame() {
    players = [];
    revealed = {};
    votes = {};
    round = 1;
    document.getElementById("roundCounter").textContent = round;
    const num = parseInt(document.getElementById("numPlayers").value);
    for (let i = 0; i < num; i++) {
        let name = document.getElementById(`player${i}`).value.trim();
        if (!name) {
            alert(`Please enter a name for Player ${i + 1}.`);
            return;
        }
        players.push(name);
    }
    players = shuffle(players);
    const numImposters = parseInt(document.getElementById("numImposters").value);
    if (isNaN(numImposters) || numImposters <= 0 || numImposters >= players.length) {
        alert("Number of imposters must be positive and less than the total number of players.");
        return;
    }
    imposters = new Set();
    const imposterIndices = shuffle(Array.from({ length: players.length }, (_, i) => i)).slice(0, numImposters);
    imposterIndices.forEach(index => imposters.add(players[index]));
    players.forEach(playerName => {
        let displayWordForPlayer = keyword;
        let playerRole = imposters.has(playerName) ? 'Imposter' : 'Civilian';
        if (playerRole === 'Imposter') {
            displayWordForPlayer = 'You are the Imposter!';
        }
        revealed[playerName] = {
            role: playerRole,
            word: displayWordForPlayer
        };
    });
    // Hide all other sections to prevent overlap
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("nameEntry").classList.add("hidden");
    document.getElementById("gameStart").classList.add("hidden");
    document.getElementById("votingPhase").classList.add("hidden");
    document.getElementById("results").classList.add("hidden");
    // Hide the discussion announcement at the start of reveal phase
    document.getElementById("discussionAnnouncement").textContent = "";
    // Show reveal and discussion phase
    document.getElementById("revealPhase").classList.remove("hidden");
    document.getElementById("discussionPhase").classList.remove("hidden");
    renderRevealButtons();
}

// --- Player Reveal Buttons ---
// This function needs to be defined to create the buttons that call 'revealWord'
function renderRevealButtons() {
    const playerButtonsDiv = document.getElementById("playerButtons");
    playerButtonsDiv.innerHTML = "";
    players.forEach(playerName => {
        const button = document.createElement('button');
        button.textContent = playerName;
        button.id = `revealBtn-${playerName}`;
        button.onclick = () => revealWord(button, playerName);
        button.className = "player-button";
        playerButtonsDiv.appendChild(button);
    });
}


// Shows the word to a player (Imposter or Keyword)
function revealWord(button, name) {
    if (button.classList.contains("clicked")) return;
    button.classList.add("clicked");
    button.disabled = true;
    const messageDiv = document.getElementById("wordMessage");
    const playerInfo = revealed[name];
    if (playerInfo.role === 'Civilian') {
        messageDiv.textContent = `Your word is \"${playerInfo.word}\"`;
    } else {
        messageDiv.textContent = `You are an imposter.`;
    }
    messageDiv.classList.remove("hidden");
    // Hide the discussion announcement during reveal phase
    document.getElementById("discussionAnnouncement").textContent = "";
    setTimeout(() => {
        messageDiv.classList.add("hidden");
        const allButtons = document.querySelectorAll("#playerButtons button");
        const allRevealed = Array.from(allButtons).every(btn => btn.disabled);
        if (allRevealed) {
            document.getElementById("revealPhase").classList.add("hidden");
            setTimeout(() => {
                // Show the discussion announcement after all have revealed and cooldown
                const discussionStarter = players[0];
                const showCategory = document.getElementById("showCategory").checked;
                if (publicCategory && showCategory) {
                    document.getElementById("discussionAnnouncement").textContent = `The category of the word is ${publicCategory}. ${discussionStarter}, start the discussion.`;
                } else {
                    document.getElementById("discussionAnnouncement").textContent = `${discussionStarter}, start the discussion.`;
                }
                document.getElementById("discussionPhase").classList.remove("hidden");
            }, 500);
        }
    }, 5000);
}

// ... (rest of your functions like startVoting, resetVotes, finishVoting, checkWinCondition, prepareNextRound, resetGame)
// No changes needed in those for this specific request.

    // --- Voting Phase ---
    function startVoting() {
      document.getElementById("gameStart").classList.add("hidden");
      const vDiv = document.getElementById("voteButtons");
      vDiv.innerHTML = "";

      // Initialize votes for current active players and a 'Skip' option
      votes = {};
      players.forEach(name => {
        votes[name] = 0;
        const btn = document.createElement("button");
        btn.textContent = `${name} (0)`;
        btn.className = "vote-button";
        btn.onclick = () => {
          votes[name]++;
          btn.textContent = `${name} (${votes[name]})`;
        };
        vDiv.appendChild(btn);
      });

      // Add Skip button
      votes["Skip"] = 0;
      const skipBtn = document.createElement("button");
      skipBtn.textContent = `Skip (0)`;
      skipBtn.className = "vote-button";
      skipBtn.onclick = () => {
        votes["Skip"]++;
        skipBtn.textContent = `Skip (${votes["Skip"]})`;
      };
      vDiv.appendChild(skipBtn);

      document.getElementById("votingPhase").classList.remove("hidden");
    }

    // Resets all votes for the current round
    function resetVotes() {
      // Reset all counts in the votes object
      for (const name in votes) {
        votes[name] = 0;
      }
      // Update the button texts to reflect the reset counts
      const voteButtons = document.querySelectorAll("#voteButtons button");
      voteButtons.forEach(btn => {
        // Extract the player name (or "Skip") from the current button text
        const namePart = btn.textContent.split(' ')[0];
        btn.textContent = `${namePart} (0)`;
      });
    }

    // --- Results & Win Condition ---
    function finishVoting() {
      let maxVotes = 0;
      let playersWithMaxVotes = [];
      for (const name in votes) {
        if (name !== "Skip") {
          if (votes[name] > maxVotes) {
            maxVotes = votes[name];
            playersWithMaxVotes = [name];
          } else if (votes[name] === maxVotes && maxVotes > 0) {
            playersWithMaxVotes.push(name);
          }
        }
      }
      const skipVotes = votes["Skip"] || 0;
      let result = "";
      let votedOut = null;
      if (playersWithMaxVotes.length === 0 || skipVotes >= maxVotes) {
        result = "No one was kicked out.";
        // Show IMPOSTER_NOT_KICKED_IMAGE in this case
        document.getElementById("endImage").src = "PATH_TO_IMPOSTER_NOT_KICKED_IMAGE";
        document.getElementById("endImage").classList.remove("hidden");
      } else if (playersWithMaxVotes.length > 1) {
        result = "Voting tied. No one was kicked out.";
        // Show IMPOSTER_NOT_KICKED_IMAGE in this case
        document.getElementById("endImage").src = "PATH_TO_IMPOSTER_NOT_KICKED_IMAGE";
        document.getElementById("endImage").classList.remove("hidden");
      } else {
        votedOut = playersWithMaxVotes[0];
        result = `${votedOut} was kicked out.`;
        if (imposters.has(votedOut)) {
            if (showImposterWhenKicked) {
                result += " They were an imposter.";
                // Show IMPOSTER_KICKED_IMAGE when imposter is kicked and box is ticked
                document.getElementById("endImage").src = "PATH_TO_IMPOSTER_KICKED_IMAGE";
                document.getElementById("endImage").classList.remove("hidden");
            } else {
                // Show IMPOSTER_NOT_KICKED_IMAGE when imposter is kicked but box is NOT ticked
                document.getElementById("endImage").src = "PATH_TO_IMPOSTER_NOT_KICKED_IMAGE";
                document.getElementById("endImage").classList.remove("hidden");
            }
            imposters.delete(votedOut);
        } else {
            if (showImposterWhenKicked) {
                result += " They were not an imposter.";
            }
            // Show IMPOSTER_NOT_KICKED_IMAGE when a non-imposter is kicked out
            document.getElementById("endImage").src = "PATH_TO_IMPOSTER_NOT_KICKED_IMAGE";
            document.getElementById("endImage").classList.remove("hidden");
        }
        players = players.filter(p => p !== votedOut);
      }
      document.getElementById("resultText").textContent = result;
      document.getElementById("votingPhase").classList.add("hidden");
      document.getElementById("results").classList.remove("hidden");
      if (!checkWinCondition()) {
        document.getElementById("nextRoundButton").classList.remove("hidden");
        document.getElementById("roundCounter").textContent = ++round;
      }
    }

    // Checks for game win/loss conditions
    function checkWinCondition() {
      const nextRoundButton = document.getElementById("nextRoundButton");
      const playAgainButton = document.getElementById("playAgainButton");
      const endImage = document.getElementById("endImage");
      // Civilians win if all imposters are caught
      if (imposters.size === 0) {
        document.getElementById("resultText").textContent += "\nCivilians win! All imposters have been caught.";
        nextRoundButton.classList.add("hidden");
        playAgainButton.classList.remove("hidden");
        // Show civilians win image
        endImage.src = "PATH_TO_CIVILIANS_WIN_IMAGE";
        endImage.classList.remove("hidden");
        return true;
      }
      // Imposters win if they outnumber or equal the civilians
      if (imposters.size >= (players.length - imposters.size)) {
        document.getElementById("resultText").textContent += "\nImposters win! Civilians are equal or outnumbered to the imposters.";
        // Show IMPOSTERS_WIN_IMAGE when imposters win (civilians lose)
        endImage.src = "PATH_TO_IMPOSTERS_WIN_IMAGE";
        endImage.classList.remove("hidden");
        nextRoundButton.classList.add("hidden");
        playAgainButton.classList.remove("hidden");
        return true;
      }
      return false;
    }

    // --- Round Management ---
    function prepareNextRound() {
      // Hide results and prepare for the next voting phase
      document.getElementById("results").classList.add("hidden");
      document.getElementById("nextRoundButton").classList.add("hidden");
      document.getElementById("playAgainButton").classList.add("hidden"); // Ensure hidden
      document.getElementById("resultText").textContent = "";
      document.getElementById("endImage").classList.add("hidden");
      document.getElementById("endImage").src = ""; // Clear image source
      startVoting(); // Begin the next voting round
    }

    // Resets the entire game to the setup phase
    function resetGame() {
      // Reset all game state variables
      players = [];
      imposters = new Set();
      keyword = "";
      revealed = {};
      votes = {};
      round = 1;
      showImposterWhenKicked = false;

      // Reset UI elements to initial state
      document.getElementById("numPlayers").value = "";
      document.getElementById("numImposters").value = "";
      document.getElementById("randomWord").checked = false;
      document.getElementById("showImposter").checked = false;
      document.getElementById("keywordInput").value = "";
      document.getElementById("keywordInput").disabled = false; // Enable keyword input

      // Hide all game sections except setup
      document.getElementById("setup").classList.remove("hidden");
      document.getElementById("nameEntry").classList.add("hidden");
      document.getElementById("revealPhase").classList.add("hidden");
      document.getElementById("gameStart").classList.add("hidden");
      document.getElementById("votingPhase").classList.add("hidden");
      document.getElementById("results").classList.add("hidden");

      // Clear dynamic content
      document.getElementById("nameInputs").innerHTML = "";
      document.getElementById("playerButtons").innerHTML = "";
      document.getElementById("voteButtons").innerHTML = "";
      document.getElementById("resultText").textContent = "";
      document.getElementById("endImage").classList.add("hidden");
      document.getElementById("endImage").src = "";
      document.getElementById("nextRoundButton").classList.add("hidden");
      document.getElementById("playAgainButton").classList.add("hidden");
      document.getElementById("roundCounter").textContent = "1";
      document.getElementById("discussionAnnouncement").textContent = "";
    }

window.startNameEntry = startNameEntry;
window.startGame = startGame;