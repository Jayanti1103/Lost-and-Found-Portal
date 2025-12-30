<?php

session_start();

require 'db.php';


use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/phpmailer/Exception.php';
require '../vendor/phpmailer/PHPMailer.php';
require '../vendor/phpmailer/SMTP.php';



if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Origin: *"); 
    http_response_code(200);
    exit;
}

$endpoint = $_GET['endpoint'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents('php://input'), true);



if ($endpoint === 'register' && $method === 'POST') {

    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $phone = $data['phone'] ?? ''; 
    $password = $data['password'] ?? '';

    if (empty($username) || empty($email) || empty($password) || empty($phone)) {
        json_response(['error' => 'All fields are required.'], 400);
    }

    
    if (!preg_match('/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/', $password)) {
        json_response(['error' => 'Password too weak. Must have 8+ chars, 1 uppercase, 1 number, 1 symbol.'], 400);
    }

    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $verification_token = bin2hex(random_bytes(32));

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
        $stmt->execute([$email, $username]);
        if ($stmt->fetch()) {
            json_response(['error' => 'Email or username already exists.'], 409); 
        }

        
        $sql = "INSERT INTO users (username, email, phone, password_hash, verification_token) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$username, $email, $phone, $password_hash, $verification_token]);
        
        
        $mail = new PHPMailer(true);
        try {
            
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'jayanti9676@gmail.com'; // <-- CHECK THIS
            $mail->Password   = 'slcn iton bcpd qujd'; // <-- CHECK THIS
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            
            $mail->setFrom('jayanti9676@gmail.com', 'Lost & Found Portal');
            $mail->addAddress($email, $username); 

            
            $mail->isHTML(true);
            $mail->Subject = 'Verify Your Account - Lost & Found Portal';
            $verification_link = "http://localhost/Lost-and-Found-Portal/verify.php?token=" . $verification_token;
            
            
            $mail->Body    = "Hi $username,<br><br>"
                           . "Welcome to the Lost & Found Portal! Please click the link below to verify your account:<br><br>"
                           . "<strong>$verification_link</strong><br><br>"
                           . "Your registered phone number is: $phone<br><br>"
                           . "If you did not sign up, please ignore this email.";

            $mail->send();
            
            json_response(['message' => 'Registration initiated! Please check your email to verify your account. You cannot log in until verified.'], 201); 
            
        } catch (Exception $e) {
            json_response(['error' => "User was registered, but the verification email could not be sent. Mailer Error: {$mail->ErrorInfo}"], 500);
        }
        

    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}



if ($endpoint === 'login' && $method === 'POST') {

    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        json_response(['error' => 'Email and password are required.'], 400);
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {

            if ($user['is_verified'] == 1) {
                $_SESSION['user_id'] = $user['user_id'];
                $_SESSION['username'] = $user['username'];

                json_response([
                    'message' => 'Login successful!',
                    'username' => $user['username']
                ]);
            } else {
                json_response(['error' => 'Your account is not verified. Please check your email for the verification link.'], 403); 
            }

        } else {
            json_response(['error' => 'Invalid email or password.'], 401); 
        }

    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'items' && $method === 'GET') {

    if (!isset($_SESSION['user_id'])) {
        json_response(['error' => 'You must be logged in to view items.', 'status_code' => 401], 401);
    }

    try {
        $sql = "SELECT 
                    items.*, 
                    (SELECT image_url FROM item_images WHERE item_id = items.item_id LIMIT 1) as image_url
                FROM items 
                WHERE status = 'approved' AND item_type = 'found'
                ORDER BY items.created_at DESC";

        $stmt = $pdo->query($sql);
        $items = $stmt->fetchAll();
        json_response($items); 
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}



if ($endpoint === 'logout' && $method === 'GET') {
    session_destroy();
    json_response(['message' => 'Logged out successfully.']);
}



if ($endpoint === 'report' && $method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        json_response(['error' => 'You must be logged in to report an item.'], 401);
    }
    $user_id = $_SESSION['user_id'];
    $item_type = $_POST['item_type'] ?? '';
    $title = $_POST['title'] ?? '';
    $item_date = $_POST['item_date'] ?? '';
    if (empty($item_type) || empty($title) || empty($item_date)) {
        json_response(['error' => 'Item Type, Title, and Date are required.'], 400);
    }
    $description = $_POST['description'] ?? null;
    $location = $_POST['location'] ?? null;
    $image_url = null;
    $upload_error = null;
    if (isset($_FILES['item_image']) && $_FILES['item_image']['error'] == 0) {
        $file = $_FILES['item_image'];
        $file_name = $file['name'];
        $file_tmp_name = $file['tmp_name'];
        $file_size = $file['size'];
        $file_ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        $allowed_ext = ['jpg', 'jpeg', 'png', 'gif'];
        if (in_array($file_ext, $allowed_ext)) {
            if ($file_size < 5000000) { // 5MB limit
                $new_file_name = "item_" . uniqid('', true) . "." . $file_ext;
                $upload_destination = '../uploads/' . $new_file_name;
                if (move_uploaded_file($file_tmp_name, $upload_destination)) {
                    $image_url = 'uploads/' . $new_file_name;
                } else {
                    $upload_error = 'Failed to move uploaded file. Check folder permissions.';
                }
            } else {
                $upload_error = 'File is too large (Max 5MB).';
            }
        } else {
            $upload_error = 'Invalid file type (Only JPG, JPEG, PNG, GIF allowed).';
        }
    }
    if ($upload_error) {
        json_response(['error' => $upload_error], 400);
    }
    try {
        $sql = "INSERT INTO items (user_id, item_type, title, description, location, item_date, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'pending')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, $item_type, $title, $description, $location, $item_date]);
        $new_item_id = $pdo->lastInsertId();
        if ($image_url && $new_item_id) {
            $img_sql = "INSERT INTO item_images (item_id, image_url) VALUES (?, ?)";
            $img_stmt = $pdo->prepare($img_sql);
            $img_stmt->execute([$new_item_id, $image_url]);
        }
        json_response(['message' => 'Item reported successfully! It is pending admin approval.'], 201);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}


if ($endpoint === 'admin-login' && $method === 'POST') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    if (empty($username) || empty($password)) {
        json_response(['error' => 'Username and password are required.'], 400);
    }
    try {
        $stmt = $pdo->prepare("SELECT * FROM admin WHERE username = ?");
        $stmt->execute([$username]);
        $admin = $stmt->fetch();
        if ($admin && password_verify($password, $admin['password_hash'])) {
            $_SESSION['admin_id'] = $admin['admin_id'];
            $_SESSION['admin_username'] = $admin['username'];
            json_response(['message' => 'Admin login successful!']);
        } else {
            json_response(['error' => 'Invalid admin username or password.'], 401);
        }
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'get-pending' && $method === 'GET') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    try {
        $sql = "SELECT i.item_id, i.item_type, i.title, i.item_date, u.email as reported_by,
                       (SELECT ii.image_url FROM item_images ii WHERE ii.item_id = i.item_id LIMIT 1) as image_url
                FROM items i
                JOIN users u ON i.user_id = u.user_id
                WHERE i.status = 'pending'
                ORDER BY i.created_at ASC";
        $stmt = $pdo->query($sql);
        $items = $stmt->fetchAll();
        json_response($items); 
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'approve-item' && $method === 'POST') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    $item_id = $data['item_id'] ?? null;
    if (empty($item_id)) {
        json_response(['error' => 'Item ID is required.'], 400);
    }
    try {
        $sql = "UPDATE items SET status = 'approved' WHERE item_id = ? AND status = 'pending'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$item_id]);
        json_response(['message' => 'Item approved successfully.']);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'deny-item' && $method === 'POST') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    $item_id = $data['item_id'] ?? null;
    if (empty($item_id)) {
        json_response(['error' => 'Item ID is required.'], 400);
    }
    try {
        $sql = "UPDATE items SET status = 'denied' WHERE item_id = ? AND status = 'pending'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$item_id]);
        json_response(['message' => 'Item denied successfully.']);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'get-stats' && $method === 'GET') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    try {
        $pending_stmt = $pdo->query("SELECT COUNT(*) as count FROM items WHERE status = 'pending'");
        $pending_count = $pending_stmt->fetch()['count'];
        $approved_stmt = $pdo->query("SELECT COUNT(*) as count FROM items WHERE status = 'approved'");
        $approved_count = $approved_stmt->fetch()['count'];
        $user_stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        $user_count = $user_stmt->fetch()['count'];
        json_response(['pending' => $pending_count, 'approved' => $approved_count, 'users' => $user_count]);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'submit-claim' && $method === 'POST') {
    if (!isset($_SESSION['user_id'])) {
        json_response(['error' => 'You must be logged in to submit a claim.'], 401);
    }
    $claimant_user_id = $_SESSION['user_id'];
    $item_id = $data['item_id'] ?? null;
    $proof = $data['proof'] ?? '';
    if (empty($item_id) || empty($proof)) {
        json_response(['error' => 'Item ID and proof of ownership are required.'], 400);
    }
    try {
        $sql = "INSERT INTO claims (item_id, claimant_user_id, proof_description, claim_status) 
                VALUES (?, ?, ?, 'pending')";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$item_id, $claimant_user_id, $proof]);
        json_response(['message' => 'Your claim has been submitted successfully for review.'], 201);
    } catch (PDOException $e) {
        if ($e->getCode() == '23000') {
            json_response(['error' => 'You have already submitted a claim for this item.'], 409);
        }
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}


if ($endpoint === 'get-pending-claims' && $method === 'GET') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    try {
        $sql = "SELECT 
                    c.claim_id, 
                    c.proof_description, 
                    c.created_at as claim_date,
                    i.title as item_title,
                    u.email as claimant_email
                FROM claims c
                JOIN users u ON c.claimant_user_id = u.user_id
                JOIN items i ON c.item_id = i.item_id
                WHERE c.claim_status = 'pending'
                ORDER BY c.created_at ASC";
        $stmt = $pdo->query($sql);
        $claims = $stmt->fetchAll();
        json_response($claims); 
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'approve-claim' && $method === 'POST') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    $claim_id = $data['claim_id'] ?? null;
    if (empty($claim_id)) {
        json_response(['error' => 'Claim ID is required.'], 400);
    }
    try {
        $stmt = $pdo->prepare("UPDATE claims SET claim_status = 'approved' WHERE claim_id = ?");
        $stmt->execute([$claim_id]);
        $stmt = $pdo->prepare("SELECT item_id FROM claims WHERE claim_id = ?");
        $stmt->execute([$claim_id]);
        $item_id = $stmt->fetchColumn();
        if ($item_id) {
            $stmt = $pdo->prepare("UPDATE items SET status = 'claimed' WHERE item_id = ?");
            $stmt->execute([$item_id]);
        }
        json_response(['message' => 'Claim approved. Item has been marked as claimed.']);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'deny-claim' && $method === 'POST') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    $claim_id = $data['claim_id'] ?? null;
    if (empty($claim_id)) {
        json_response(['error' => 'Claim ID is required.'], 400);
    }
    try {
        $sql = "UPDATE claims SET claim_status = 'denied' WHERE claim_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$claim_id]);
        json_response(['message' => 'Claim denied successfully.']);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}

if ($endpoint === 'get-my-reports' && $method === 'GET') {
    if (!isset($_SESSION['user_id'])) {
        json_response(['error' => 'You must be logged in to view your reports.'], 401);
    }
    $user_id = $_SESSION['user_id'];
    try {
        $lost_sql = "SELECT item_id, title, location, status, item_date FROM items 
                     WHERE user_id = ? AND item_type = 'lost'
                     ORDER BY created_at DESC";
        $lost_stmt = $pdo->prepare($lost_sql);
        $lost_stmt->execute([$user_id]);
        $lost_items = $lost_stmt->fetchAll();
        $found_sql = "SELECT item_id, title, location, status, item_date FROM items 
                      WHERE user_id = ? AND item_type = 'found'
                      ORDER BY created_at DESC";
        $found_stmt = $pdo->prepare($found_sql);
        $found_stmt->execute([$user_id]);
        $found_items = $found_stmt->fetchAll();
        json_response(['lost_items' => $lost_items, 'found_items' => $found_items]);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'check-auth' && $method === 'GET') {
    if (isset($_SESSION['user_id'])) {
        json_response(['logged_in' => true, 'username' => $_SESSION['username']]);
    } else {
        json_response(['logged_in' => false]);
    }
}


if ($endpoint === 'get-all-items' && $method === 'GET') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';
    try {
        $sql = "SELECT i.item_id, i.item_type, i.title, i.status, i.item_date, u.email as reported_by,
                       (SELECT ii.image_url FROM item_images ii WHERE ii.item_id = i.item_id LIMIT 1) as image_url
                FROM items i
                JOIN users u ON i.user_id = u.user_id
                WHERE 1=1";
        $params = [];
        if (!empty($status)) {
            $sql .= " AND i.status = ?";
            $params[] = $status;
        }
        if (!empty($search)) {
            $sql .= " AND (i.title LIKE ? OR i.description LIKE ? OR u.email LIKE ?)";
            $search_param = "%$search%";
            $params[] = $search_param;
            $params[] = $search_param;
            $params[] = $search_param;
        }
        $sql .= " ORDER BY i.created_at DESC";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll();
        json_response($items); 
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'delete-item' && $method === 'POST') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    $item_id = $data['item_id'] ?? null;
    if (empty($item_id)) {
        json_response(['error' => 'Item ID is required.'], 400);
    }
    try {
        $sql = "DELETE FROM items WHERE item_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$item_id]);
        json_response(['message' => 'Item (and all related claims/images) has been permanently deleted.']);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'get-all-users' && $method === 'GET') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    try {
        $sql = "SELECT user_id, username, email, created_at FROM users ORDER BY created_at DESC";
        $stmt = $pdo->query($sql);
        $users = $stmt->fetchAll();
        json_response($users); 
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'delete-user' && $method === 'POST') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    $user_id = $data['user_id'] ?? null;
    if (empty($user_id)) {
        json_response(['error' => 'User ID is required.'], 400);
    }
    try {
        $sql = "DELETE FROM users WHERE user_id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id]);
        json_response(['message' => 'User (and all their reported items and claims) has been permanently deleted.']);
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'submit-feedback' && $method === 'POST') {
    $user_id = $_SESSION['user_id'] ?? null;
    $name = $data['name'] ?? null;
    $email = $data['email'] ?? null;
    $rating = $data['rating'] ?? '';
    $message = $data['message'] ?? '';
    if (empty($rating) || empty($message)) {
        json_response(['error' => 'Rating and message are required.'], 400);
    }
    try {
        $sql = "INSERT INTO feedback (user_id, name, email, rating, message) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$user_id, $name, $email, $rating, $message]);
        json_response(['message' => 'Thank you! Your feedback has been submitted.'], 201);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}


if ($endpoint === 'submit-contact' && $method === 'POST') {
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $message = $data['message'] ?? '';
    if (empty($name) || empty($email) || empty($message)) {
        json_response(['error' => 'Name, email, and message are required.'], 400);
    }
    try {
        $sql = "INSERT INTO contact_messages (name, email, message) 
                VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$name, $email, $message]);
        json_response(['message' => 'Your message has been sent. We will get back to you soon!'], 201);
    } catch (PDOException $e) {
        json_response(['error' => 'Database error: ' . $e->getMessage()], 500);
    }
}


if ($endpoint === 'get-all-feedback' && $method === 'GET') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    try {
        
        $sql = "SELECT * FROM feedback ORDER BY submitted_at DESC";
        $stmt = $pdo->query($sql);
        $feedback = $stmt->fetchAll();
        json_response($feedback); 
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}


if ($endpoint === 'get-all-messages' && $method === 'GET') {
    if (!isset($_SESSION['admin_id'])) {
        json_response(['error' => 'You must be logged in as an admin.'], 401);
    }
    try {
        
        $sql = "SELECT * FROM contact_messages ORDER BY submitted_at DESC";
        $stmt = $pdo->query($sql);
        $messages = $stmt->fetchAll();
        json_response($messages); 
    } catch (PDOException $e) {
        json_response(['error' => $e->getMessage()], 500);
    }
}



json_response(['error' => 'Endpoint not found.'], 404);

?>