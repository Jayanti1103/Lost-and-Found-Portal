<?php
$password_to_hash = 'pass1234';
$hash = password_hash($password_to_hash, PASSWORD_BCRYPT);

echo "Here is your new password hash:<br><br>";
echo $hash;
?>