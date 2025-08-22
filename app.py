import os
import json
from flask import Flask, render_template, jsonify, request

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "aurevo-luxury-secret-key")

# Load menu data
def load_menu_data():
    try:
        with open('data/menu.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {"categories": [], "items": []}

@app.route('/')
def index():
    menu_data = load_menu_data()
    return render_template('index.html', menu_data=menu_data)

@app.route('/api/menu')
def api_menu():
    menu_data = load_menu_data()
    return jsonify(menu_data)

@app.route('/api/search')
def api_search():
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
