# Chameleon Game (Pass & Play Edition)

[Play the game live here!](https://chameleongame.vercel.app/)

## About
This is a web-based implementation of the social deduction game "Chameleon." Designed for in-person groups, it uses a pass-and-play approach: players share a single device, passing it around to receive their secret word or role. The game is simple, fun, and perfect for parties or gatherings.

**Note on Gameplay:** This is not a 1:1 copy of the original board game. It's an adaptation that blends the core concept of "Chameleon" (a secret word) with the round-based elimination and win conditions of social deduction games like *Mafia* or *Among Us*. You can still play the original way of playing though, it is totally up to you. 

## Game Rules (Classic Chameleon)
- Players: 3–13
- One or more players are randomly chosen as the Chameleon(s); the rest are Civilians.
- A secret word (with a category) is selected. All Civilians see the word; the Chameleon(s) do not.
- Players take turns giving clues about the word—subtle enough to not reveal it, but clear enough to prove they know it.
- After one round of clues, everyone votes on who they think the Chameleon is.
- If the Chameleon is caught, Civilians win. If not, the Chameleon gets a chance to guess the secret word for a last-minute win.

## How This Website Implements the Game
- **Pass & Play:** Players enter their names and pass the device to each other to receive their word or Chameleon role.
- **Word Selection:** Choose a custom keyword or generate a random one from a built-in list. Optionally, show the category before discussion.
- **Role Reveal:** Each player taps their name to see their word (or "You are the Imposter!" if they are the Chameleon).
- **Discussion:** After all have seen their word, the first player starts the discussion. Players try to identify the Chameleon based on the clues given.
- **Voting:** All players vote on who they think the Chameleon is. The game tracks votes and reveals the result.
- **Win Conditions:** The game automatically checks for win conditions (Civilians win if all Chameleons are caught; Chameleons win if they equal or outnumber Civilians).
- **Options:** You can choose to reveal the Chameleon when kicked out, and whether to show the category before discussion.

## Features
- Simple, intuitive interface for quick setup and play
- Pass-and-play design for in-person groups
- Custom or random word selection
- Automatic role assignment and win condition checking
- Optional game settings for more variety
- Themed for clarity and ease of use

Enjoy playing!