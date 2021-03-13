package kalkulierbar.sqlite

import java.sql.*

class DatabaseHandler {

    companion object {
        private var connection: Connection? = null
        private val maxEntriesPerFormula: Int = 5

        @Suppress("TooGenericExceptionCaught")
        public fun init() {
            try {
                Class.forName("org.sqlite.JDBC")
                connection = DriverManager.getConnection("jdbc:sqlite:test.db")
            } catch (e: Exception) {
                println("Connection to database could not be established")
                println(e.message)
            }
        }

        @Suppress("MaxLineLength")
        public fun createTable(identifier: String) {
            val sqlIdentifier = parseIdentifier(identifier)
            if (connection != null) {
                val stmt = (connection as Connection).createStatement()
                val create: String =
                    "CREATE TABLE IF NOT EXISTS $sqlIdentifier (formula VARCHAR(8000) NOT NULL, statistics VARCHAR(8000) NOT NULL, score INTEGER NOT NULL, time TIMESTAMP NOT NULL);"
                stmt.execute(create)
                stmt.close()
            }
        }

        public fun insert(identifier: String, keyFormula: String, statisticsJSON: String, score: Int) {
            val sqlIdentifier = parseIdentifier(identifier)
            statisticsJSON.replace("\"", "\\\"")
            if (connection != null) {
                val stmt = (connection as Connection).createStatement()
                val insert: String =
                    "INSERT INTO $sqlIdentifier VALUES (\"$keyFormula\", '$statisticsJSON', $score, CURRENT_TIMESTAMP);"
                stmt.execute(insert)
                stmt.close()

                val queryStmt = (connection as Connection).createStatement()
                val queryCount: String =
                    "SELECT COUNT() FROM $identifier WHERE formula = \"$keyFormula\";"
                val result: ResultSet = queryStmt.executeQuery(queryCount)
                result.next()
                val count = result.getInt(1)

                if (count > this.maxEntriesPerFormula) {
                    val difference = count - maxEntriesPerFormula
                    val deleteStmt = (connection as Connection).createStatement()
                    val delete: String =
                        "DELETE FROM $identifier WHERE rowid IN (SELECT rowid FROM $identifier WHERE formula = \"$keyFormula\" ORDER BY time ASC LIMIT $difference);"
                    println(delete)
                    deleteStmt.executeUpdate(delete)
                }
            }
        }

        public fun query(identifier: String, formula: String): MutableList<String> {
            val sqlIdentifier = parseIdentifier(identifier)
            val returnList = mutableListOf<String>()
            if (connection != null) {
                val stmt = (connection as Connection).createStatement()
                val query: String = "SELECT * FROM $sqlIdentifier WHERE formula = \"$formula\" ORDER BY score DESC;"
                val result: ResultSet = stmt.executeQuery(query)
                while (result.next()) {
                    val tmp = result.getString(2).toString()
                    returnList.add(tmp)
                }
                stmt.close()
            }
            return returnList
        }

        private fun parseIdentifier(identifier: String): String {
            return identifier.replace("-", "")
        }
    }
}
