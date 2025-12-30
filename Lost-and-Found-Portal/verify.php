<?php
// Include the database connection
require 'api/db.php';

$message = '';

// Check if a token is provided in the URL
if (isset($_GET['token']) && !empty($_GET['token'])) {

    $token = $_GET['token'];

    try {
        // Find the user with this token
        $stmt = $pdo->prepare("SELECT * FROM users WHERE verification_token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if ($user) {
            // User found! Update their status to 'verified'
            $update_stmt = $pdo->prepare("UPDATE users SET is_verified = 1, verification_token = NULL WHERE user_id = ?");
            $update_stmt->execute([$user['user_id']]);

            $message = "Success! Your account is now verified. You can now <a href='login.html'>log in</a>.";
        } else {
            // No user found with this token
            $message = "Error: This verification link is invalid or has already been used.";
        }

    } catch (PDOException $e) {
        $message = "Error: " . $e->getMessage();
    }

} else {
    $message = "Error: No verification token provided.";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Verification</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark fixed-top">
         <div class="container">
            <a class="navbar-brand" href="index.html">
                <img src="images/logo.jpg" alt="Portal Logo" height="40">
                Lost & Found
            </a>
        </div>
    </nav>

    <main class="main-content">
        <div class="container">
            <div class="row">
                <div class="col-md-8 mx-auto">
                    <div class="card shadow-sm border-0 p-4 p-md-5 text-center">
                        <h2>Account Verification</h2>
                        <p class="lead"><?php echo $message; ?></p>
                    </div>
                </div>
            </div>
        </div>
    </main>
</body>
</html>