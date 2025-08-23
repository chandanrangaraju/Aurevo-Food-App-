import os
import json
import sqlite3
from flask import Flask, render_template, jsonify, request, redirect, url_for, session
from werkzeug.security import generate_password_hash, check_password_hash

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "aurevo-luxury-secret-key")

# ---- Database Helper ----
def get_db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

# ---- Create users table if not exists ----
def init_db():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---- Menu Loader ----
def load_menu_data():
    try:
        with open('data/menu.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"categories": [], "items": []}

# ---- Routes ----
@app.route('/')
def root():
    if "user_id" in session:
        return redirect(url_for("index"))
    return redirect(url_for("login"))

@app.route('/home')
def index():
    if "user_id" not in session:
        return redirect(url_for("login"))
    menu_data = load_menu_data()
    return render_template('index.html', menu_data=menu_data)

# ---- Auth Routes ----
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        conn.close()

        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            return redirect(url_for("index"))
        else:
            return render_template("login.html", error="Invalid username or password")
    return render_template("login.html")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        hash_pass = generate_password_hash(password)

        conn = get_db_connection()
        try:
            conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hash_pass))
            conn.commit()
        except:
            return render_template("signup.html", error="Username already exists")
        finally:
            conn.close()

        return redirect(url_for("login"))
    return render_template("signup.html")

@app.route("/logout")
def logout():
    session.pop("user_id", None)
    return redirect(url_for("login"))

# ---- API Endpoints ----
@app.route('/api/menu')
def api_menu():
    if "user_id" not in session:
        return redirect(url_for("login"))
    menu_data = load_menu_data()
    return jsonify(menu_data)

@app.route('/api/search')
def api_search():
    if "user_id" not in session:
        return redirect(url_for("login"))
    query = request.args.get('q', '').lower()
    menu_data = load_menu_data()
    
    if not query:
        return jsonify([])
    
    results = []
    for item in menu_data.get('items', []):
        if (query in item.get('name', '').lower() or 
            query in item.get('description', '').lower() or 
            query in item.get('category', '').lower()):
            results.append(item)
    
    return jsonify(results)

@app.route("/payment")
def payment():
    if "user_id" not in session:
        return redirect(url_for("login"))
    return render_template("payment.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

