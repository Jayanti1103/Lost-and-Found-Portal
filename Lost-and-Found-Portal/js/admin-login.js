
$(document).ready(function() {

    $('#adminLoginForm').on('submit', async function(event) {
        event.preventDefault();

        
        $('#login-error').hide().text('');

      
        var username = $('#adminUser').val().trim();
        var password = $('#adminPass').val().trim();

        if (username === '' || password === '') {
            $('#login-error').text('Username and password are required.').show();
            return;
        }

        var formData = {
            username: username,
            password: password
        };

        try {
            const response = await fetch('api/api.php?endpoint=admin-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                
                window.location.href = 'admin.html';
            } else {
                
                $('#login-error').text(result.error).show();
            }

        } catch (error) {
            console.error('Error:', error);
            $('#login-error').text('An unexpected error occurred.').show();
        }
    });
});