import pymysql

# Database configuration
DB_HOST = "mysql-faradays.alwaysdata.net"
DB_USER = "faradays"
DB_PASSWORD = "modcom2026"
EMPLOYEE_DB = "faradays_employee_sokogarden"

def create_tables():
    try:
        # Connect to employee database
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=EMPLOYEE_DB,
            cursorclass=pymysql.cursors.DictCursor,
        )

        cursor = connection.cursor()

        # Create product_details table if it doesn't exist
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS product_details (
            product_id INT AUTO_INCREMENT PRIMARY KEY,
            product_name VARCHAR(255) NOT NULL,
            product_description TEXT,
            product_category VARCHAR(100),
            product_cost DECIMAL(10, 2) NOT NULL,
            product_image VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """

        cursor.execute(create_table_sql)
        connection.commit()

        print("Table 'product_details' created successfully (or already exists)")

        # Check if table has any data
        cursor.execute("SELECT COUNT(*) as count FROM product_details")
        result = cursor.fetchone()
        print(f"Current product count: {result['count']}")

        cursor.close()
        connection.close()

    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    create_tables()