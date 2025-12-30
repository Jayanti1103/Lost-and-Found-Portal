$(document).ready(function() {
    
    const tableBody = $('#all-users-table-body');

    
    async function fetchAllUsers() {
        tableBody.empty().append('<tr><td colspan="5" class="text-center">Loading users...</td></tr>');

        try {
            const url = `api/api.php?endpoint=get-all-users`;
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 401) {
                    alert('You are not logged in. Redirecting to login page.');
                    window.location.href = 'admin-login.html';
                    return;
                }
                throw new Error('Failed to fetch data');
            }

            const users = await response.json();
            renderTable(users);

        } catch (error) {
            console.error('Error fetching users:', error);
            tableBody.empty().append(`<tr><td colspan="5" class="text-center">Error loading users: ${error.message}</td></tr>`);
        }
    }

    
    function renderTable(users) {
        tableBody.empty();
        if (users.length === 0) {
            tableBody.append('<tr><td colspan="5" class="text-center">No users found.</td></tr>');
        } else {
            users.forEach(user => {
                const row = `
                    <tr data-user-id="${user.user_id}">
                        <td>${user.user_id}</td>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-danger btn-sm btn-delete-user" data-id="${user.user_id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </td>
                    </tr>
                `;
                tableBody.append(row);
            });
        }
    }

    async function deleteUser(userId) {
        try {
            const response = await fetch(`api/api.php?endpoint=delete-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: userId })
            });

            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                $(`tr[data-user-id="${userId}"]`).fadeOut(500, function() { $(this).remove(); });
            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('An unexpected error occurred.');
        }
    }

    
    
    
    tableBody.on('click', '.btn-delete-user', function() {
        const userId = $(this).data('id');
        if (confirm(`Are you sure you want to PERMANENTLY DELETE this user? All their items and claims will also be deleted. This action cannot be undone.`)) {
            deleteUser(userId);
        }
    });

    fetchAllUsers();

});