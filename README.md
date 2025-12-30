# 🔍 Lost & Found Portal

## 🌐 Live Demo
**Experience the live application here:**
### 🚀 [https://jayanti-project.infinityfreeapp.com](https://jayanti-project.infinityfreeapp.com)

## 📖 About The Project

Imagine losing your wallet, keys, or ID card on a busy campus. The panic is real. The **Lost & Found Portal** is a web-based solution designed to replace chaotic physical "lost and found" boxes with a digital, searchable, and efficient system.

This platform bridges the gap between those who have lost items and the good Samaritans who find them. With a secure login system, easy reporting tools, and a transparent claiming process, this portal ensures that lost items find their way back to their rightful owners quickly and securely.

### 🌟 Why this project?
* **Problem:** Physical lost and found centers are unorganized and hard to access.
* **Solution:** A centralized digital hub accessible 24/7.
* **Impact:** Reduces stress for students/staff and increases the recovery rate of lost valuables.

## ✨ Key Features

### 🔐 **Secure Authentication**
* **User Registration & Login:** Secure access for students and staff to ensure accountability.
* **Session Management:** Keeps user data safe and personalized.

### 🕵️ **For the "Lost" (Victims)**
* **Report Lost Items:** Easily upload details, descriptions, and last known locations of missing items.
* **Status Tracking:** Monitor if anyone has found or reported your item.

### 🤝 **For the "Found" (Finders)**
* **Report Found Items:** Upload images and details of items found on campus.
* **Helping Hand:** A dedicated space for honest individuals to help others.

### 🔎 **Smart Search & Claim System**
* **Browse Inventory:** A clean, visual feed of all reported items (Found & Lost).
* **Keyword Search:** Quickly filter items by name, category (e.g., "Electronics", "Books"), or location.
* **One-Click Claim:** Found something that belongs to you? Submit a claim request instantly.

### 📧 **Notifications (Integration Ready)**
* Built with **PHPMailer** support to send email alerts when an item is claimed or matched.


## 🛠️ Tech Stack used

This project was built using a robust and classic web development stack:

| Component | Technology |
| **Frontend** | HTML5, CSS3, JavaScript, Bootstrap |
| **Backend** | PHP |
| **Database** | MySQL (Relational Database Management) |
| **Server** | Apache (XAMPP for local |
| **Libraries** | PHPMailer |


## ⚙️ How to Run Locally

If you want to run this project on your own computer, follow these simple steps:

### Prerequisites
* **XAMPP**  installed.
* **Git** installed.
* A code editor like **VS Code**.

### Installation Steps

1.  **Clone the Repo**
    ```bash
    git clone [https://github.com/Jayanti1103/Lost-and-Found-Portal.git](https://github.com/Jayanti1103/Lost-and-Found-Portal.git)
    ```

2.  **Move to HTDOCS**
    * Copy the `Lost-and-Found-Portal` folder.
    * Paste it inside your XAMPP installation folder: `C:\xampp\htdocs\`

3.  **Setup Database**
    * Open XAMPP Control Panel and start **Apache** and **MySQL**.
    * Go to your browser: `http://localhost/phpmyadmin`
    * Create a new database named: **`lost_and_found_db`** 
    * Click **Import** and upload the `.sql` file found in the `database/` folder of this repo.

4.  **Configure Connection**
    * Open `db.php` in VS Code.
    * Ensure the settings match your local environment:
      ```php
      $host = 'localhost';
      $user = 'root';
      $pass = '';
      $dbname = 'lost_and_found_db';
      ```

5.  **Run It!**
    * Open your browser and go to: `http://localhost/Lost-and-Found-Portal`

## 🤝 Contribution

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 👤 Author

**Jayanti Jha**
* **GitHub:** [Jayanti1103](https://github.com/Jayanti1103)
* **Live Project:** [Lost & Found Portal](https://jayanti-project.infinityfreeapp.com)

### ⭐ Show your support
Give a ⭐️ if you liked this project!
