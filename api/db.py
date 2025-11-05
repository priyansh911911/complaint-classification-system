import sqlite3
import os

def get_db_connection():
    # Use /tmp directory for Vercel
    db_path = '/tmp/complaints.db'
    conn = sqlite3.connect(db_path)
    return conn

def init_db():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Students table
    c.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # Complaints table
    c.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            student_name TEXT NOT NULL,
            complaint_text TEXT NOT NULL,
            category TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students (student_id)
        )
    ''')
    
    # Insert demo student accounts
    c.execute('''
        INSERT OR IGNORE INTO students (student_id, name, email, password) 
        VALUES 
        ('STU001', 'John Doe', 'john@college.edu', 'student123'),
        ('STU002', 'Jane Smith', 'jane@college.edu', 'student123'),
        ('STU003', 'Mike Johnson', 'mike@college.edu', 'student123')
    ''')
    
    conn.commit()
    conn.close()