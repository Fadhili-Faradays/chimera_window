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
            employee_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
        )
        """

        cursor.execute(create_table_sql)
        connection.commit()

        # Alter table to add employee_id if it doesn't exist
        try:
            alter_sql = "ALTER TABLE product_details ADD COLUMN employee_id INT, ADD CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id)"
            cursor.execute(alter_sql)
            connection.commit()
            print("Added employee_id column to product_details")
        except Exception as e:
            print(f"Column may already exist: {e}")

        print("Table 'product_details' created or updated successfully")

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