# The DatabaseHandler

KalkulierbaR supports saving of Statistics for a solved proof. 

# Statistic Calculus

For Calculi which extend the interface StatisticCalculus proofs can be saved. 

The Calculus needs to implement methods for serializing Statistics for that proof into a Json and for the other way around
`statisticToJson(statistic: Statisitic): String` and `jsonToStatistic(json: String): Statistic`

`getStatistic(state: String, name: String?): String` accepts a state which is in json form and a name and returns the statistics for that proof including the username in jsonFormat. This method is used in main.kt when receiving a state that should be saved in the database.

it also needs to implement the method `getStartingFormula(state: String): String` which accepts a state in Json format and returns the formula which is the formula the user entered after it has been parsed. The starting formula is used by the database as the key for a table.

# Statistic

The Statistic interface is the interface which represents certain properties of a closed proof that should be saved. It includes a `name` property as every Statisic is assigned to a user but it can be extended by any other property which may be relevant for a given proof. The interface also contains a method `columnNames(): List<String>` which is used by the frontend as headers for the different properties. So the List should include the names of the properties which are saved in the Statistic object in the order in which they are serialized.

# Statistics
An object of the Statistics class is the object which is then send to the frontend and contains all relevant statistics information. As properties it contains the starting formula of the proof that was solved as well as all Statistic entries of that proof which were saved in the database. It also contains the columnNames of the entries which are displayed as the header of the statisitcs table in the frontend.
The Statistics object is send to the frontend so it also contains a method `toJson` which serializes the object into a JsonString.

# Database

Statistics are saved in an SQLite database. The name of the database is `Statistics` and saved in the file `Statistics.db`
For each Statistic Calculus a new table is created in the database with the identifier of the calculus as the table name.
The schema of each table is `formula VARCHAR(8000) NOT NULL, statistics VARCHAR(8000) NOT NULL, time TIMESTAMP NOT NULL`.
`formula` refers to the starting formula of a given proof and it is used when querying for statistics for a solved proof.
`statistics` is the Statistic object serialized to a Json string. This column saves all the statistics data defined in Statistic
`time` is the time the proof was saved in the database. This column is used to limit the amount of proofs that can be saved in the database. After 1000 entries have been added to a formula of a table the oldest entry will be deleted everytime a new entry is saved under the same table and formula.

