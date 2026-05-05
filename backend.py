from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import os
import requests
import datetime
import base64
from requests.auth import HTTPBasicAuth

app = Flask(__name__)
CORS(app)
app.config["UPLOAD_FOLDER"] = "static/images"

# Database configuration
DB_HOST = "mysql-faradays.alwaysdata.net"
DB_USER = "faradays"
DB_PASSWORD = "modcom2026"
USER_DB = "faradays_sokogarden"
EMPLOYEE_DB = "faradays_employee_sokogarden"  # Update this to your employee database name

os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)


def get_db_connection(role="user"):
    database = USER_DB if role == "user" else EMPLOYEE_DB
    return pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASSWORD,
        database=database,
        cursorclass=pymysql.cursors.DictCursor,
    )


def get_request_data():
    return request.get_json() or request.form or {}


@app.route("/api/signup", methods=["POST"])
def signup():
    data = get_request_data()
    username = data.get("username")
    email = data.get("email")
    phone = data.get("phonenumber") or data.get("phone")
    password = data.get("password")

    if not username or not email or not phone or not password:
        return jsonify({"message": "All fields are required."}), 400

    connection = get_db_connection("user")
    cursor = connection.cursor()

    sql = "INSERT INTO users (username, email, phone, password) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql, (username, email, phone, password))
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "Sign up successfully"})


@app.route("/api/user_signin", methods=["POST"])
def user_signin():
    return _signin("user")


@app.route("/api/employee_signin", methods=["POST"])
def employee_signin():
    return _signin("employee")


def _signin(role):
    data = get_request_data()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    connection = get_db_connection(role)
    cursor = connection.cursor()

    if role == "employee":
        sql = "SELECT employee_id AS id, username, email, phone FROM employees WHERE email=%s AND password=%s"
    else:
        sql = "SELECT user_id AS id, username, email, phone FROM users WHERE email=%s AND password=%s"

    cursor.execute(sql, (email, password))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    return jsonify({"message": "Login successful", "user": user, "token": ""})


@app.route("/api/add_product", methods=["POST"])
def add_product():
    product_name = request.form.get("product_name")
    product_cost = request.form.get("product_cost")
    product_category = request.form.get("product_category")
    product_description = request.form.get("product_description")
    product_image = request.files.get("product_image")

    if not product_name or not product_cost or not product_category or not product_description or not product_image:
        return jsonify({"message": "All product fields are required."}), 400

    image_name = product_image.filename
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], image_name)
    product_image.save(file_path)

    connection = get_db_connection("employee")
    cursor = connection.cursor()
    sql = "INSERT INTO product_details (product_name, product_description, product_category, product_cost, product_image) VALUES (%s, %s, %s, %s, %s)"
    cursor.execute(sql, (product_name, product_description, product_category, product_cost, image_name))
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "Product added successfully"})


@app.route("/api/get_products", methods=["GET"])
def get_products():
    connection = get_db_connection("employee")
    cursor = connection.cursor()
    sql = "SELECT * FROM product_details"
    cursor.execute(sql)
    products = cursor.fetchall()
    cursor.close()
    connection.close()

    return jsonify(products)


@app.route("/api/user_account", methods=["GET"])
def user_account():
    email = request.args.get("email")
    if not email:
        return jsonify({"message": "Email is required."}), 400

    connection = get_db_connection("user")
    cursor = connection.cursor()
    cursor.execute("SELECT user_id AS id, username, email, phone FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        cursor.close()
        connection.close()
        return jsonify({"message": "User not found."}), 404

    cursor.close()
    connection.close()

    return jsonify({"profile": user, "items": []})


@app.route("/api/employee_account", methods=["GET"])
def employee_account():
    email = request.args.get("email")
    if not email:
        return jsonify({"message": "Email is required."}), 400

    connection = get_db_connection("employee")
    cursor = connection.cursor()
    cursor.execute("SELECT employee_id AS id, username, email, phone FROM employees WHERE email=%s", (email,))
    employee = cursor.fetchone()

    if not employee:
        cursor.close()
        connection.close()
        return jsonify({"message": "Employee not found."}), 404

    cursor.close()
    connection.close()

    return jsonify({"profile": employee, "items": []})


@app.route("/api/mpesa_payment", methods=["POST"])
def mpesa_payment():
    amount = request.form.get("amount")
    phone = request.form.get("phone")

    if not amount or not phone:
        return jsonify({"message": "Amount and phone are required."}), 400

    consumer_key = "GTWADFxIpUfDoNikNGqq1C3023evM6UH"
    consumer_secret = "amFbAoUByPV2rM5A"

    auth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    token_response = requests.get(auth_url, auth=HTTPBasicAuth(consumer_key, consumer_secret))
    token_data = token_response.json()
    access_token = f"Bearer {token_data['access_token']}"

    timestamp = datetime.datetime.today().strftime('%Y%m%d%H%M%S')
    passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
    business_short_code = "174379"
    data_to_encode = business_short_code + passkey + timestamp
    encoded = base64.b64encode(data_to_encode.encode())
    password = encoded.decode('utf-8')

    payload = {
        "BusinessShortCode": business_short_code,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": amount,
        "PartyA": phone,
        "PartyB": business_short_code,
        "PhoneNumber": phone,
        "CallBackURL": "https://modcom.co.ke/api/confirmation.php",
        "AccountReference": "account",
        "TransactionDesc": "account"
    }

    headers = {
        "Authorization": access_token,
        "Content-Type": "application/json"
    }

    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    response = requests.post(url, json=payload, headers=headers)
    return jsonify({"message": "Please complete payment on your phone.", "mpesa_response": response.json()})


if __name__ == "__main__":
    app.run(debug=True)
