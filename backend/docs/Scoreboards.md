# Proof Scoreboards

KalkulierbaR supports saving a list of "high scores" for a solved proof. In this context, a "score" is a key-value mapping that contains one or more categories (e.g. number of rules applied, proof tree depth, etc) with associated values. Both keys and values are expected to be strings.

# Scored Calculus

Scoreboards are available for calculi that extend `ScoredCalculus`.

The Calculus needs to implement methods for calculating scores and extracting the proof's base formula (in canonical form) from a proof state:
`scoreFromState(state: State, name: String?): Map<String, String>` and `formulaFromState(state: State): String`. The name parameter of the former method contains a username that can be included in the score map.

# Getting Scores

A list of scores for a given calculus can be obtained from the `POST <calculus>/scoreboard` endpoint, passing the JSON state of the current proof as a parameter.  
The returned `Scores` object contains a list of scores at `Scores.entries` and the base formula at `Scores.formula`.

# Submitting Scores

A new score for a proof can be submitted by sending the JSON state of the closed proof (`state`) and a username (`name`) to `POST <calculus>/submit-score`. Note that anyone can submit scores and no effort is made to prevent cheating. 

# Data Persistence & Security

Scores are kept in-memory first and periodically flushed to a backup file named `kbar-scoreboard.json`. While KalkulierbaR attempts to limit possible malicious use of scoreboards, you should be aware that **some malicious or abusive content may be written to said file and/or sent to KalkulierbaR users over the network**. To ensure that no unauthenticated data is written to disk or served to other users, set `Scoreboard.READONLY = true`.
