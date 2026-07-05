from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import os
import requests
import datetime
import base64
import re
from requests.auth import HTTPBasicAuth
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024

app = Flask(__name__)

JWT_SECRET = os.getenv("JWT_SECRET")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET must be set in the environment for secure authentication.")

JWT_EXPIRATION_SECONDS = int(os.getenv("JWT_EXPIRATION_SECONDS", 3600))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

DB_HOST = os.getenv("DB_HOST", "mysql-faradays.alwaysdata.net")
DB_USER = os.getenv("DB_USER", "faradays")
DB_PASSWORD = os.getenv("DB_PASSWORD", "modcom2026")
USER_DB = os.getenv("USER_DB", "faradays_sokogarden")
EMPLOYEE_DB = os.getenv("EMPLOYEE_DB", "faradays_employee_sokogarden")

app.config["SECRET_KEY"] = JWT_SECRET
app.config["UPLOAD_FOLDER"] = "static/images"
app.config["MAX_CONTENT_LENGTH"] = MAX_UPLOAD_SIZE
CORS(app, origins=CORS_ORIGINS, supports_credentials=False)

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
    if request.is_json:
        return request.get_json()
    return request.form


def get_token_serializer():
    return URLSafeTimedSerializer(JWT_SECRET, salt="auth-token")


def generate_auth_token(data):
    return get_token_serializer().dumps(data)


def verify_auth_token(token):
    try:
        return get_token_serializer().loads(token, max_age=JWT_EXPIRATION_SECONDS)
    except (SignatureExpired, BadSignature):
        return None


def get_request_token():
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    return auth_header.split(" ", 1)[1]


def authorize(required_role=None):
    token = get_request_token()
    payload = verify_auth_token(token) if token else None
    if not payload:
        return None
    if required_role and payload.get("role") != required_role:
        return None
    return payload


@app.after_request
def set_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://faradays.alwaysdata.net; connect-src 'self' https://faradays.alwaysdata.net;"
    return response


@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({"message": "Uploaded file is too large. Maximum allowed size is 5 MB."}), 413


@app.route("/api/signup", methods=["POST"])
def signup():
    data = get_request_data()
    username = data.get("username")
    email = data.get("email")
    phone = data.get("phonenumber") or data.get("phone")
    password = data.get("password")

    if not username or not email or not phone or not password:
        return jsonify({"message": "All fields are required."}), 400

    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters long."}), 400

    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return jsonify({"message": "Invalid email address."}), 400

    connection = get_db_connection("user")
    cursor = connection.cursor()

    cursor.execute("SELECT user_id FROM users WHERE email=%s", (email,))
    if cursor.fetchone():
        cursor.close()
        connection.close()
        return jsonify({"message": "A user with this email already exists."}), 409

    password_hash = generate_password_hash(password)
    sql = "INSERT INTO users (username, email, phone, password) VALUES (%s, %s, %s, %s)"
    cursor.execute(sql, (username, email, phone, password_hash))
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
        sql = "SELECT employee_id AS id, username, email, phone, password FROM employees WHERE email=%s"
    else:
        sql = "SELECT user_id AS id, username, email, phone, password FROM users WHERE email=%s"

    cursor.execute(sql, (email,))
    user = cursor.fetchone()
    cursor.close()
    connection.close()

    if not user or not check_password_hash(user.get("password", ""), password):
        return jsonify({"message": "Invalid credentials"}), 401

    user_payload = {
        "id": user["id"],
        "email": user["email"],
        "role": role,
    }
    token = generate_auth_token(user_payload)
    user.pop("password", None)

    return jsonify({"message": "Login successful", "user": user, "token": token})


@app.route("/api/add_product", methods=["POST"])
def add_product():
    auth_payload = authorize("employee")
    if not auth_payload:
        return jsonify({"message": "Unauthorized"}), 401

    product_name = request.form.get("product_name")
    product_cost = request.form.get("product_cost")
    product_category = request.form.get("product_category")
    product_description = request.form.get("product_description")
    product_image = request.files.get("product_image")
    employee_id = auth_payload.get("id")

    if not product_name or not product_cost or not product_category or not product_description or not product_image:
        return jsonify({"message": "All product fields are required."}), 400

    try:
        product_cost_value = float(product_cost)
        if product_cost_value <= 0:
            raise ValueError()
    except ValueError:
        return jsonify({"message": "Product cost must be a valid positive number."}), 400

    image_name = secure_filename(product_image.filename)
    if not image_name or "." not in image_name or image_name.rsplit(".", 1)[1].lower() not in ALLOWED_IMAGE_EXTENSIONS:
        return jsonify({"message": "Invalid image format. Allowed types are png, jpg, jpeg, gif, webp."}), 400

    timestamp = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    image_name = f"{timestamp}_{image_name}"
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], image_name)
    product_image.save(file_path)

    connection = get_db_connection("employee")
    cursor = connection.cursor()
    sql = "INSERT INTO product_details (product_name, product_description, product_category, product_cost, product_image, employee_id) VALUES (%s, %s, %s, %s, %s, %s)"
    cursor.execute(sql, (product_name, product_description, product_category, product_cost, image_name, employee_id))
    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "Product added successfully"})


@app.route("/api/get_products", methods=["GET"])
def get_products():
    try:
        connection = get_db_connection("employee")
        cursor = connection.cursor()
        sql = """
        SELECT pd.*, e.username as seller_name
        FROM product_details pd
        LEFT JOIN employees e ON pd.employee_id = e.employee_id
        """
        cursor.execute(sql)
        products = cursor.fetchall()
        cursor.close()
        connection.close()

        return jsonify(products)
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/api/user_account", methods=["GET"])
def user_account():
    auth_payload = authorize("user")
    if not auth_payload:
        return jsonify({"message": "Unauthorized"}), 401

    user_id = auth_payload.get("id")
    connection = get_db_connection("user")
    cursor = connection.cursor()
    cursor.execute("SELECT user_id AS id, username, email, phone FROM users WHERE user_id=%s", (user_id,))
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
    auth_payload = authorize("employee")
    if not auth_payload:
        return jsonify({"message": "Unauthorized"}), 401

    employee_id = auth_payload.get("id")
    connection = get_db_connection("employee")
    cursor = connection.cursor()
    cursor.execute("SELECT employee_id AS id, username, email, phone FROM employees WHERE employee_id=%s", (employee_id,))
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

    consumer_key = os.getenv("MPESA_CONSUMER_KEY")
    consumer_secret = os.getenv("MPESA_CONSUMER_SECRET")
    passkey = os.getenv("MPESA_PASSKEY")
    business_short_code = os.getenv("MPESA_SHORT_CODE")
    callback_url = os.getenv("MPESA_CALLBACK_URL")

    if not all([consumer_key, consumer_secret, passkey, business_short_code, callback_url]):
        return jsonify({"message": "Payment gateway is not configured properly."}), 500

    auth_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    token_response = requests.get(auth_url, auth=HTTPBasicAuth(consumer_key, consumer_secret), timeout=10)
    if token_response.status_code != 200:
        return jsonify({"message": "Unable to authorize payment gateway."}), 502

    token_data = token_response.json()
    access_token = f"Bearer {token_data.get('access_token')}"

    timestamp = datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')
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
        "CallBackURL": callback_url,
        "AccountReference": "account",
        "TransactionDesc": "account"
    }

    headers = {
        "Authorization": access_token,
        "Content-Type": "application/json"
    }

    url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    if response.status_code != 200:
        return jsonify({"message": "Payment request failed.", "details": response.text}), 502

    return jsonify({"message": "Please complete payment on your phone.", "mpesa_response": response.json()})


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug_mode)
