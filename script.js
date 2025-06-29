const keywords = ["Ocean", "Tiger", "Banana", "Doctor", "Rocket", "Library", "Mountain", "Computer", "Pizza", "Guitar", "Astronaut", "Elephant", "Book"];
    let players = []; // List of active player names
    let imposters = new Set(); // Set of imposter names
    let keyword = ""; // The secret keyword for civilians
    let revealed = {}; // Tracks which players have revealed their word
    let votes = {}; // Stores votes for the current round
    let round = 1; // Current round number
    let showImposterWhenKicked = false; // Option to reveal imposter role

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

      showImposterWhenKicked = document.getElementById("showImposter").checked;

      // Handle keyword generation/input
      if (document.getElementById("randomWord").checked) {
        keyword = keywords[Math.floor(Math.random() * keywords.length)];
        document.getElementById("keywordInput").value = "[Randomly Generated]"; // Display that it's random
        document.getElementById("keywordInput").disabled = true; // Disable input if random
      } else {
        keyword = document.getElementById("keywordInput").value.trim();
        if (!keyword) {
          alert("Please enter a keyword or choose to generate a random one.");
          return;
        }
        document.getElementById("keywordInput").disabled = false; // Ensure input is enabled if not random
      }

      // Generate player name input fields
      const nameInputsDiv = document.getElementById("nameInputs");
      nameInputsDiv.innerHTML = "";
      for (let i = 0; i < num; i++) {
        nameInputsDiv.innerHTML += `<label>Player ${i + 1} Name: <input type='text' id='player${i}'></label>`;
      }

      // Transition to name entry
      document.getElementById("setup").classList.add("hidden");
      document.getElementById("nameEntry").classList.remove("hidden");
    }

    // --- Game Start & Role Assignment Phase ---
    function startGame() {
      players = []; // Clear previous players
      revealed = {}; // Reset revealed status
      votes = {}; // Reset votes
      round = 1; // Reset round counter
      document.getElementById("roundCounter").textContent = round; // Update display

      const num = parseInt(document.getElementById("numPlayers").value);
      for (let i = 0; i < num; i++) {
        let name = document.getElementById(`player${i}`).value.trim();
        if (!name) {
          alert(`Please enter a name for Player ${i + 1}.`);
          return;
        }
        players.push(name);
      }

      players = shuffle(players); // Shuffle players before assigning roles

      // Assign imposters
      imposters = new Set();
      const numImposters = parseInt(document.getElementById("numImposters").value);
      while (imposters.size < numImposters) {
        // Ensure the randomly selected player is not already an imposter
        const potentialImposter = players[Math.floor(Math.random() * players.length)];
        imposters.add(potentialImposter);
      }

      renderRevealButtons();
      document.getElementById("nameEntry").classList.add("hidden");
      document.getElementById("revealPhase").classList.remove("hidden");
    }

    // Renders buttons for players to reveal their words
    function renderRevealButtons() {
      const btnDiv = document.getElementById("playerButtons");
      btnDiv.innerHTML = "";
      players.forEach(name => {
        const btn = document.createElement("button");
        btn.textContent = name;
        btn.className = "player-button";
        btn.onclick = () => revealWord(btn, name);
        btnDiv.appendChild(btn);
      });
    }

    // Shows the word to a player (Imposter or Keyword)
    function revealWord(button, name) {
      if (revealed[name]) return; // Prevent revealing multiple times

      revealed[name] = true;
      button.classList.add("clicked"); // Visually indicate button has been clicked

      const messageDiv = document.getElementById("wordMessage");
      messageDiv.textContent = imposters.has(name) ? "You are the Imposter!" : `Keyword: ${keyword}`;
      messageDiv.classList.remove("hidden");

      setTimeout(() => {
        messageDiv.classList.add("hidden"); // Hide the message after 5 seconds
        // Check if all players have revealed their word
        if (Object.keys(revealed).length === players.length) {
          document.getElementById("revealPhase").classList.add("hidden");
          document.getElementById("gameStart").classList.remove("hidden");
          const starter = players[Math.floor(Math.random() * players.length)];
          document.getElementById("starterText").textContent = `${starter} starts the discussion!`;
        }
      }, 5000);
    }

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

      // Determine who has the maximum votes, excluding "Skip"
      for (const name in votes) {
        if (name !== "Skip") {
          if (votes[name] > maxVotes) {
            maxVotes = votes[name];
            playersWithMaxVotes = [name]; // New highest vote, reset list
          } else if (votes[name] === maxVotes && maxVotes > 0) {
            playersWithMaxVotes.push(name); // Tie, add to list
          }
        }
      }

      const skipVotes = votes["Skip"] || 0;
      let result = "";
      let votedOut = null;

      // Logic for determining the outcome of the vote
      if (playersWithMaxVotes.length === 0 || skipVotes >= maxVotes) {
        // No one was voted out (everyone got 0, or skip votes are dominant/equal)
        result = "No one was kicked out. Voting skipped or tied.";
      } else if (playersWithMaxVotes.length > 1) {
        // A tie between multiple players with the highest votes
        result = "Voting resulted in a tie. No one was kicked out.";
      } else {
        // A single player has the most votes
        votedOut = playersWithMaxVotes[0];
        result = `${votedOut} was voted out.`;

        // Check if the voted-out player was an imposter
        if (imposters.has(votedOut)) {
          result += showImposterWhenKicked ? " They were an imposter." : "";
          imposters.delete(votedOut); // Remove imposter
        } else {
          result += showImposterWhenKicked ? " They were not an imposter." : "";
        }
        // Remove the voted-out player from the active players list, regardless of role
        players = players.filter(p => p !== votedOut);
      }

      // Display results
      document.getElementById("resultText").textContent = result;
      document.getElementById("votingPhase").classList.add("hidden");
      document.getElementById("results").classList.remove("hidden");

      // Check win condition immediately after vote outcome
      if (!checkWinCondition()) {
        document.getElementById("nextRoundButton").classList.remove("hidden"); // Only show next round if game continues
        document.getElementById("roundCounter").textContent = ++round; // Increment round only if game continues
      }
    }

    // Checks for game win/loss conditions
    function checkWinCondition() {
      const nextRoundButton = document.getElementById("nextRoundButton");
      const playAgainButton = document.getElementById("playAgainButton");
      const endImage = document.getElementById("endImage");

      // Civilians win if all imposters are caught
      if (imposters.size === 0) {
        document.getElementById("resultText").textContent += "\nAll imposters are caught! Civilians win!";
        nextRoundButton.classList.add("hidden");
        playAgainButton.classList.remove("hidden"); // Show play again
        return true;
      }
      // Imposters win if they outnumber or equal the civilians
      // players.length = total active players; imposters.size = active imposters
      // players.length - imposters.size = active civilians
      if (imposters.size >= (players.length - imposters.size)) {
        document.getElementById("resultText").textContent += "\nImposters have taken over! Imposters win!";
        endImage.src = "C:/chameleon/7918bd309f6324716188106c6445a5ea.jpg"; // Placeholder image for imposter win
        endImage.classList.remove("hidden");
        nextRoundButton.classList.add("hidden");
        playAgainButton.classList.remove("hidden"); // Show play again
        return true;
      }
      return false; // No win condition met yet
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
    }