package kalkulierbar.sqlite

import java.sql.*


class DatabaseHandler(
) {

    private var connection: Connection? = null;
    private var identifier: String = "";

    constructor(identifier: String): this() {
        this.identifier = identifier
        try {
            Class.forName("org.sqlite.JDBC")
            connection = DriverManager.getConnection("jdbc:sqlite:test.db")
            this.createTable()
        } catch(e: Exception) {
            println("Connection could not be established")
            println(e.message)
        }
    }

    public fun createTable() {
        if (connection != null) {
            val stmt = (connection as Connection).createStatement()
            val create: String = 
                "create table if not exists $identifier (formula varchar(255), name varchar(30));"
            stmt.execute(create)
            stmt.close()
        }
    }

    public fun insert(keyFormula: String, name: String) {
        if (connection != null) {
            val stmt = (connection as Connection).createStatement()
            val insert: String =
                "INSERT INTO $identifier VALUES (\"$keyFormula\", \"$name\");"
            stmt.execute(insert)
            stmt.close()
        }
    }

    // public fun insert(keyFormula: String, statistics: Any) {
    //     if (connection != null) {
    //         val stmt = (connection as Connection).createStatement()
    //         val query: String = "SELECT * FROM a;" 
    //         val a: ResultSet = stmt.executeQuery(query)
    //         println("Result:")
    //         println(a.getString(1).toString())
    //         stmt.close()
    //     }
    // }

    public fun query() {
        if (connection != null) {
            val stmt = (connection as Connection).createStatement()
            val query: String = "SELECT * FROM $identifier;" 
            val a: ResultSet = stmt.executeQuery(query)
            println("Result:")
            while (a.next()) {
                println(a.getString(1).toString() + ", " + a.getString(2).toString())
            }
            stmt.close()
        }
    }
}